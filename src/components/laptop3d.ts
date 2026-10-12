// Procedural 3D laptop — port of "Laptop 3D.html" from the Claude Design
// project (Developer Spec §1, option B). Loaded lazily by <Laptop>; the CSS
// laptop stays on screen as the poster until this is ready.
import * as THREE from "three";

export type LaptopState = { open: number; lines: number; glow: number; seam: number };

const CODE: [string, keyof typeof COLORS][][] = [
  [["<", "p"], ["button", "t"]],
  [["  type", "a"], ["=", "p"], ['"button"', "s"]],
  [["  aria-label", "a"], ["=", "p"], ['"Close dialog"', "s"]],
  [["  onClick", "a"], ["={", "p"], ["close", "x"], ["}>", "p"]],
  [["  <", "p"], ["Icon ", "t"], ["name", "a"], ["=", "p"], ['"x"', "s"], [" aria-hidden", "a"], [" />", "p"]],
  [["</", "p"], ["button", "t"], [">", "p"]],
];
const COLORS = { p: "#8a8a96", t: "#7cc4ff", a: "#c4a7ff", s: "#9be3b0", x: "#f5f5f7" };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function roundedRect(w: number, h: number, r: number, oy = 0) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = oy;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Soft gradient sprite texture (used for the hinge seam and contact shadow). */
function gradientTexture(stops: [number, string][], radial: boolean) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = radial ? 256 : 32;
  const g = c.getContext("2d")!;
  const grad = radial
    ? g.createRadialGradient(128, 128, 0, 128, 128, 128)
    : g.createLinearGradient(0, 0, c.width, 0);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  if (!radial) {
    // fade top/bottom edges too
    const v = g.createLinearGradient(0, 0, 0, c.height);
    v.addColorStop(0, "rgba(0,0,0,1)");
    v.addColorStop(0.5, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = v;
    g.fillRect(0, 0, c.width, c.height);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* One WebGL context for the whole page. Every laptop (hero, dive bridge,
   contact, companion) renders its own scene through this renderer into a
   region of its buffer and copies the frame into its own 2D canvas — browsers
   cap live WebGL contexts, and one context per laptop made the last ones fail
   ("Cannot read properties of null (reading 'precision')"). */
type Shared = { renderer: THREE.WebGLRenderer; envTex: THREE.Texture; w: number; h: number };
let shared: Shared | null = null;

function buildEnvironment(renderer: THREE.WebGLRenderer) {
  // Studio environment for real metal reflections.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x0b0b10, side: THREE.BackSide })));
  const panel = (w: number, h: number, c: THREE.Color, p: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...p);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(8, 3, new THREE.Color(2.4, 2.4, 2.5), [0, 6, 1]);
  panel(2, 6, new THREE.Color(1.4, 1.4, 1.5), [-6, 2, 2]);
  panel(2, 6, new THREE.Color(0.45, 0.65, 1.5), [6, 1.5, -2]);
  panel(6, 1.2, new THREE.Color(0.55, 0.45, 0.9), [0, 1, -6]);
  panel(10, 0.35, new THREE.Color(3, 3, 3.2), [0, 2.5, 6]); // thin strip: crisp front-edge highlight
  const envTex = pmrem.fromScene(env, 0.03).texture;
  pmrem.dispose();
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return envTex;
}

function getShared(): Shared {
  if (shared) return shared;
  const canvas = document.createElement("canvas");
  // Throws when no WebGL context can be created; callers keep the laptop empty.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const current: Shared = { renderer, envTex: buildEnvironment(renderer), w: 0, h: 0 };
  // If the GPU drops the context, start fresh on the next frame.
  canvas.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      if (shared === current) shared = null;
    },
    { once: true },
  );
  shared = current;
  return current;
}

/** Largest canvas side we render; keeps the shared buffer within GPU limits. */
export const MAX_CANVAS_PX = 4096;

export function createLaptopScene(canvas: HTMLCanvasElement) {
  const sh0 = getShared(); // fail fast (no WebGL) before building anything
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const scene = new THREE.Scene();
  scene.environment = sh0.envTex;
  scene.environmentIntensity = 0.75;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a22, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8d4ff, 0.35);
  fill.position.set(-5, 3, 2);
  scene.add(fill);
  // Cool rim light from behind separates the silhouette from the dark page.
  const rim = new THREE.DirectionalLight(0x8fb2ff, 1.1);
  rim.position.set(0, 3, -6);
  scene.add(rim);

  const M = {
    aluminum: new THREE.MeshPhysicalMaterial({
      color: 0x7d8087,
      metalness: 0.9,
      roughness: 0.38,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
    }),
    aluminumEdge: new THREE.MeshStandardMaterial({ color: 0x5a5c63, metalness: 0.95, roughness: 0.22 }),
    well: new THREE.MeshStandardMaterial({ color: 0x1b1b20, metalness: 0.2, roughness: 0.6 }),
    key: new THREE.MeshStandardMaterial({ color: 0x101013, metalness: 0, roughness: 0.55 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x030305, metalness: 0.1, roughness: 0.06 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }),
    trackpad: new THREE.MeshStandardMaterial({ color: 0x55575e, metalness: 0.55, roughness: 0.22 }),
  };

  // Screen content (code) as a texture; redrawn when the typed line count changes.
  const cv = document.createElement("canvas");
  cv.width = 2048;
  cv.height = 1280;
  const screenTex = new THREE.CanvasTexture(cv);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.anisotropy = Math.min(8, sh0.renderer.capabilities.getMaxAnisotropy());
  let drawnLines = -1;
  // Optional override of the screen content (companion laptop, §11.8).
  let custom: { title: string; lines: { t: string; c?: string }[] } | null = null;
  const drawScreen = (lines: number) => {
    drawnLines = lines;
    const g = cv.getContext("2d")!;
    g.setTransform(1.6, 0, 0, 1.6, 0, 0); // draw on the 1280×800 grid from the design
    const bg = g.createLinearGradient(0, 0, 1280, 800);
    bg.addColorStop(0, "#141a3a");
    bg.addColorStop(0.6, "#0a0c18");
    bg.addColorStop(1, "#1a1030");
    g.fillStyle = bg;
    g.fillRect(0, 0, 1280, 800);
    g.fillStyle = "rgba(255,255,255,.07)";
    g.fillRect(0, 64, 1280, 2);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = "#3a3a46";
      g.beginPath();
      g.arc(36 + i * 26, 32, 8, 0, 7);
      g.fill();
    }
    g.fillStyle = "rgba(255,255,255,.08)";
    g.beginPath();
    g.roundRect(130, 16, 150, 32, 8);
    g.fill();
    g.font = '500 22px "Geist Mono", ui-monospace, monospace';
    g.fillStyle = "#a1a1aa";
    g.fillText(custom ? custom.title : "Dialog.tsx", 148, 40);
    if (custom) {
      g.font = '500 44px "Geist Mono", ui-monospace, monospace';
      custom.lines.slice(0, 9).forEach((ln, i) => {
        g.fillStyle = ln.c ?? "#f5f5f7";
        g.fillText(ln.t, 48, 150 + i * 70);
      });
    }
    g.font = '500 34px "Geist Mono", ui-monospace, monospace';
    (custom ? [] : CODE.slice(0, lines)).forEach((toks, i) => {
      const y = 140 + i * 58;
      g.fillStyle = "#4c4c5a";
      g.fillText(String(i + 1).padStart(2), 40, y);
      let x = 120;
      toks.forEach(([t, c]) => {
        g.fillStyle = COLORS[c];
        g.fillText(t, x, y);
        x += g.measureText(t).width;
      });
      if (i === lines - 1) {
        g.fillStyle = "#5b9cff";
        g.fillRect(x + 4, y - 28, 18, 36);
      }
    });
    const sh = g.createLinearGradient(0, 0, 900, 800);
    sh.addColorStop(0, "rgba(255,255,255,.07)");
    sh.addColorStop(0.4, "rgba(255,255,255,0)");
    g.fillStyle = sh;
    g.fillRect(0, 0, 1280, 800);
    screenTex.needsUpdate = true;
  };
  const display = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, p: [number, number, number] = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p);
    return m;
  };

  // Real-world meters, y-up, centred on the origin.
  const W = 0.312;
  const D = 0.221;
  const FOOT = 0.0012;
  const laptop = new THREE.Group();

  const bt = 0.0022;
  const bd = 0.0111;
  const baseGeo = new THREE.ExtrudeGeometry(roundedRect(W - 2 * bt, D - 2 * bt, 0.011, -(D - 2 * bt) / 2), {
    depth: bd,
    bevelEnabled: true,
    bevelThickness: bt,
    bevelSize: bt,
    bevelSegments: 6,
    curveSegments: 24,
  });
  const base = mesh(baseGeo, M.aluminum);
  base.rotation.x = -Math.PI / 2;
  base.position.y = FOOT + bt;
  laptop.add(base);
  const y0 = FOOT + bd + 2 * bt;

  // Keyboard
  laptop.add(mesh(new THREE.BoxGeometry(0.284, 0.0004, 0.121), M.well, [0, y0 + 0.0001, -0.039]));
  const rows = [
    { u: Array(14).fill(1), d: 0.009 },
    { u: [...Array(13).fill(1), 1.5] },
    { u: [1.5, ...Array(13).fill(1)] },
    { u: [1.8, ...Array(11).fill(1), 1.8] },
    { u: [2.3, ...Array(10).fill(1), 2.3] },
    { u: [1, 1, 1, 1.25, 5, 1.25, 1, 1, 1] },
  ];
  const KW = 0.272;
  const GAP = 0.0027;
  let z = -0.0935;
  rows.forEach((r, ri) => {
    const d = r.d || 0.0165;
    if (ri > 0) z += ri === 1 ? 0.0045 + GAP + 0.00825 : 0.0192;
    const unit = (KW - GAP * (r.u.length - 1)) / r.u.reduce((a, b) => a + b, 0);
    let x = -KW / 2;
    r.u.forEach((u) => {
      const w = u * unit;
      laptop.add(mesh(new THREE.BoxGeometry(w, 0.0011, d), M.key, [x + w / 2, y0 + 0.00055, z]));
      x += w + GAP;
    });
  });
  laptop.add(mesh(new THREE.BoxGeometry(0.135, 0.0003, 0.08), M.trackpad, [0, y0 + 0.00005, 0.059]));
  const hinge = mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.25, 32), M.aluminumEdge, [0, y0 - 0.0006, -0.1062]);
  hinge.rotation.z = Math.PI / 2;
  laptop.add(hinge);

  // Thumb scoop on the front edge.
  const scoop = mesh(new THREE.BoxGeometry(0.06, 0.0035, 0.004), M.aluminumEdge, [0, y0 - 0.002, D / 2 - 0.0012]);
  laptop.add(scoop);

  // Lid pivots at the hinge.
  const lid = new THREE.Group();
  lid.position.set(0, y0 + 0.0008, -0.1045);
  laptop.add(lid);
  const H = 0.215;
  const lt = 0.001;
  const lidGeo = new THREE.ExtrudeGeometry(roundedRect(W - 2 * lt, H - 2 * lt, 0.011, lt), {
    depth: 0.0035,
    bevelEnabled: true,
    bevelThickness: lt,
    bevelSize: lt,
    bevelSegments: 8,
    curveSegments: 32,
  });
  lid.add(mesh(lidGeo, M.aluminum, [0, 0, -0.0045]));

  // Flat rounded panel with 0–1 UVs (ShapeGeometry UVs are in shape units).
  const roundedPanel = (w: number, h: number, r: number) => {
    const geo = new THREE.ShapeGeometry(roundedRect(w, h, r), 32);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, pos.getY(i) / h);
    uv.needsUpdate = true;
    return geo;
  };

  // Rubber gasket + edge-to-edge black glass, inset inside the aluminium's
  // rounded corners (a square glass plane used to poke out past them).
  const gasket = mesh(roundedPanel(W - 0.0024, H - 0.0024, 0.0102), M.rubber, [0, 0.0012, 0.0002]);
  lid.add(gasket);
  const bezelGlass = new THREE.MeshPhysicalMaterial({
    color: 0x040406,
    metalness: 0,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  lid.add(mesh(roundedPanel(W - 0.0052, H - 0.0052, 0.0088), bezelGlass, [0, 0.0026, 0.0004]));
  // Display: thin side/top bezels, slightly taller bottom chin.
  const DW = 0.288;
  const DH = 0.18;
  const chin = 0.0185;
  lid.add(mesh(roundedPanel(DW, DH, 0.002), display, [0, chin, 0.0006]));
  lid.add(mesh(new THREE.CircleGeometry(0.0012, 24), M.rubber, [0, chin + DH + (H - chin - DH) / 2, 0.0007]));
  const screenLight = new THREE.PointLight(0x8fb2ff, 0.02, 0.45, 2);
  screenLight.position.set(0, 0.09, 0.07);
  lid.add(screenLight);

  // Light leaking through the seam once the lid is shut (frame 8b).
  const seam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, 0.016),
    new THREE.MeshBasicMaterial({
      map: gradientTexture([[0, "rgba(91,156,255,0)"], [0.3, "#9fc0ff"], [0.7, "#d6c8ff"], [1, "rgba(167,139,250,0)"]], false),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  seam.position.set(0, y0 + 0.0035, 0.112);
  laptop.add(seam);
  // Wide soft bloom around the seam line.
  const seamGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.06),
    new THREE.MeshBasicMaterial({
      map: gradientTexture([[0, "rgba(91,156,255,0)"], [0.3, "rgba(91,156,255,0.55)"], [0.7, "rgba(167,139,250,0.55)"], [1, "rgba(167,139,250,0)"]], false),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  seamGlow.position.set(0, y0 + 0.002, 0.115);
  laptop.add(seamGlow);

  // Contact shadow on the (invisible) floor.
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.34),
    new THREE.MeshBasicMaterial({
      map: gradientTexture([[0, "rgba(0,0,0,0.85)"], [0.55, "rgba(0,0,0,0.35)"], [1, "rgba(0,0,0,0)"]], true),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.0002;
  laptop.add(shadow);

  scene.add(laptop);

  // Front view, slightly above — matches the CSS laptop's composition.
  const camera = new THREE.PerspectiveCamera(22, 760 / 520, 0.01, 10);
  // Eye ~8° above the deck; open laptop spans roughly −0.77…+0.86 of the view
  // height, so the base never touches the canvas edge.
  const target = new THREE.Vector3(0, 0.085, -0.02);
  const elev = THREE.MathUtils.degToRad(8);
  const dist = 0.8;
  camera.position.set(0, target.y + Math.sin(elev) * dist, target.z + Math.cos(elev) * dist);
  camera.lookAt(target);

  let last = "";
  const render = (s: LaptopState) => {
    const lines = Math.max(0, Math.min(CODE.length, Math.floor(s.lines + 1e-6)));
    const keyState = `${s.open.toFixed(4)}|${lines}|${s.glow.toFixed(3)}|${s.seam.toFixed(3)}`;
    if (keyState === last) return;
    last = keyState;
    if (lines !== drawnLines) drawScreen(lines);
    lid.rotation.x = Math.PI / 2 - s.open * (Math.PI / 2 + 0.3);
    const on = clamp01((s.open - 0.25) / 0.35);
    display.color.setScalar(on);
    screenLight.intensity = 0.045 * s.glow * on;
    (seam.material as THREE.MeshBasicMaterial).opacity = s.seam;
    (seamGlow.material as THREE.MeshBasicMaterial).opacity = s.seam;
    seam.visible = seamGlow.visible = s.seam > 0.001;

    let sh: Shared;
    try {
      sh = getShared();
    } catch {
      return; // context gone and can't be recreated: leave the last frame
    }
    const { renderer } = sh;
    const pw = canvas.width;
    const ph = canvas.height;
    // Grow-only buffer: switching between laptops never reallocates it per frame.
    if (pw > sh.w || ph > sh.h) {
      sh.w = Math.max(sh.w, pw);
      sh.h = Math.max(sh.h, ph);
      renderer.setSize(sh.w, sh.h, false);
    }
    scene.environment = sh.envTex;
    renderer.setViewport(0, 0, pw, ph);
    renderer.setScissor(0, 0, pw, ph);
    renderer.setScissorTest(true);
    renderer.render(scene, camera);
    renderer.setScissorTest(false);
    // WebGL's origin is bottom-left: our region is the bottom of the buffer.
    ctx.clearRect(0, 0, pw, ph);
    ctx.drawImage(renderer.domElement, 0, sh.h - ph, pw, ph, 0, 0, pw, ph);
  };

  const resize = (w: number, h: number, pixelRatio: number) => {
    canvas.width = Math.max(1, Math.min(MAX_CANVAS_PX, Math.round(w * pixelRatio)));
    canvas.height = Math.max(1, Math.min(MAX_CANVAS_PX, Math.round(h * pixelRatio)));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    last = "";
  };

  const redrawText = () => {
    drawnLines = -1;
    last = "";
  };

  const setScreen = (content: typeof custom) => {
    custom = content;
    redrawText();
  };

  const dispose = () => {
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          (m as THREE.MeshBasicMaterial).map?.dispose();
          m.dispose();
        });
      }
    });
    // The shared renderer and environment stay alive for the other laptops.
  };

  return { render, resize, redrawText, setScreen, dispose };
}
