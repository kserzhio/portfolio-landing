"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { markLoaded } from "@/lib/loadProgress";
import s from "./Laptop.module.css";

type Props = {
  /** Accessible name; when omitted the laptop is decorative. */
  label?: string;
  /** Hero laptop: load the 3D model immediately and report to the loader. */
  priority?: boolean;
  /** Canvas oversampling vs device pixels, for laptops scaled up with CSS. */
  oversample?: number;
  className?: string;
};

type Scene = ReturnType<typeof import("./laptop3d").createLaptopScene>;

const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const windowLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

/**
 * Hero/contact laptop: the three.js model from "Laptop 3D" (Developer Spec §1,
 * option B), lazily loaded. Until it's ready — or without WebGL / JS — only the
 * floor glow shows; the model fades in when ready. Driven by CSS custom
 * properties so GSAP can scrub it:
 *   --open  0 (closed) → 1 (open)
 *   --lines 0 → 6 code lines typed
 *   --glow  floor glow opacity
 *   --seam  light leaking through the hinge once shut (v2 frame 8b)
 */
export function Laptop({ label, className, priority = false, oversample = 1.5 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    if (!supportsWebGL()) {
      // No WebGL: the laptop stays empty (glow only); nothing for the loader to wait on.
      if (priority) {
        markLoaded("laptop-module");
        markLoaded("laptop");
      }
      return;
    }

    let scene: Scene | null = null;
    let loading = false;
    let visible = false;
    let disposed = false;

    const num = (cs: CSSStyleDeclaration, name: string, fallback: number) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    const tick = () => {
      if (!scene || !visible) return;
      const cs = getComputedStyle(root);
      scene.render({
        open: num(cs, "--open", 1),
        lines: num(cs, "--lines", 6),
        glow: num(cs, "--glow", 0.6),
        seam: num(cs, "--seam", 0),
      });
    };
    const size = () => {
      if (!scene) return;
      const w = root.clientWidth || 1;
      const h = root.clientHeight || 1;
      // Oversample: the hero scales the laptop up to 1.4× (the dive bridge ~3.4×) with CSS transforms.
      const maxPx = 2400 * Math.max(1, oversample / 1.5);
      const ratio = Math.min((window.devicePixelRatio || 1) * oversample, maxPx / w, oversample * 2);
      scene.resize(w, h, ratio);
      tick();
    };
    const load = async () => {
      loading = true;
      // Below-the-fold laptops wait for the page; the hero one is on the loader's critical path.
      if (!priority) await windowLoaded();
      const mod = await import("./laptop3d");
      if (priority) markLoaded("laptop-module");
      if (disposed) return;
      try {
        scene = mod.createLaptopScene(canvas);
      } catch {
        if (priority) markLoaded("laptop");
        return; // stays empty (glow only)
      }
      size();
      root.dataset.three = "ready";
      if (priority) markLoaded("laptop");
      document.fonts?.ready.then(() => {
        scene?.redrawText();
        tick();
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !scene && !loading) load();
        tick();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(root);
    if (priority && !loading) load();
    const ro = new ResizeObserver(size);
    ro.observe(root);
    gsap.ticker.add(tick);

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      scene?.dispose();
      delete root.dataset.three;
    };
  }, [priority, oversample]);

  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <div ref={rootRef} className={`${s.laptop} ${className ?? ""}`} data-laptop {...a11y}>
      <div className={s.glow} />
      <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />
    </div>
  );
}
