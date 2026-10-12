"use client";

import { useEffect, useId, useRef, useState } from "react";
import { person } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { isLoaded, loadProgress, markLoaded } from "@/lib/loadProgress";
import s from "./Loader.module.css";

const SHOW_AFTER = 400; // ms — fast loads never see the loader
const MIN_SHOWN = 900; // ms once visible
const HARD_CAP = 4000; // ms — reveal anyway, keep loading in the background
const DOTS = 12;
export const LOADER_SEEN_KEY = "loader-seen";
export const LOADER_DONE_EVENT = "loader:done";

type Geo = { x: number; y: number; w: number; h: number; r: number };

/**
 * Loading state — "the first focus ring" (Developer Spec §10, mockups La–Ld, Lm).
 * Shown only when the boot script added html.loading (JS on, first visit this
 * session). A focus ring draws around the name with real load progress, then
 * expands to the viewport edges and reveals hero frame 1a.
 */
export function Loader() {
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState("");
  const maskId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<SVGRectElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLSpanElement>(null);
  const noteRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current!;
    // Repeat visit / no loader: the markup stays display:none via CSS.
    if (!html.classList.contains("loading")) return;

    const reduced = html.dataset.motion === "reduced";
    const mobile = matchMedia("(max-width: 1023px)").matches;
    const start = performance.now();
    let shown = false;
    let finishing = false;
    let display = 0;

    // Page underneath: out of the tab order and marked busy until reveal.
    const page = [...document.body.children].filter(
      (el) => el !== root && !["SCRIPT", "NEXT-ROUTE-ANNOUNCER"].includes(el.tagName),
    ) as HTMLElement[];
    page.forEach((el) => (el.inert = true));
    const main = document.getElementById("main");
    main?.setAttribute("aria-busy", "true");
    // Set after mount so the live region announces it.
    const announce = requestAnimationFrame(() => setStatus("Loading"));

    document.fonts?.ready.then(() => markLoaded("fonts"));

    // Ring geometry: a pill around the name → the viewport inset frame.
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pill: Geo = mobile
      ? { w: 300, h: 150, r: 40, x: (W - 300) / 2, y: H * 0.48 - 75 }
      : { w: 520, h: 140, r: 64, x: (W - 520) / 2, y: H / 2 - 70 };
    const inset = mobile ? 12 : 24;
    const frame: Geo = { x: inset, y: inset, w: W - inset * 2, h: H - inset * 2, r: mobile ? 28 : 40 };
    const svg = svgRef.current!;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const shapes = svg.querySelectorAll<SVGRectElement>("[data-shape]");
    const setGeo = (g: Geo) =>
      shapes.forEach((el) => {
        el.setAttribute("x", String(g.x));
        el.setAttribute("y", String(g.y));
        el.setAttribute("width", String(g.w));
        el.setAttribute("height", String(g.h));
        el.setAttribute("rx", String(g.r));
      });
    setGeo(pill);
    const name = nameRef.current!;
    name.style.left = `${pill.x + pill.w / 2}px`;
    name.style.top = `${pill.y + pill.h / 2}px`;

    const paint = (p: number) => {
      const pct = Math.round(p * 100);
      ringRef.current?.setAttribute("stroke-dasharray", `${p * 100} 100`);
      if (counterRef.current) counterRef.current.textContent = p >= 1 ? "READY" : `LOADING · ${pct}%`;
      const filled = Math.round(p * DOTS);
      dotsRef.current?.querySelectorAll("span").forEach((d, i) => d.toggleAttribute("data-on", i < filled));
      if (noteRef.current) {
        noteRef.current.textContent =
          p >= 1 ? "Ready" : isLoaded("fonts") ? "Loading laptop model" : "Preparing an accessible experience";
      }
    };

    const cleanup = () => {
      page.forEach((el) => (el.inert = false));
      main?.removeAttribute("aria-busy");
      html.classList.remove("loading");
      try {
        sessionStorage.setItem(LOADER_SEEN_KEY, "1");
      } catch {
        /* private mode: loader may show again next visit */
      }
      window.dispatchEvent(new Event(LOADER_DONE_EVENT));
      setActive(false);
    };

    const reveal = (fast = false) => {
      gsap.ticker.remove(tick);
      if (reduced || fast) {
        gsap.to(root, { opacity: 0, duration: 0.2, onComplete: cleanup });
        return;
      }
      // Name Flips into the header logo while the ring grows to the frame.
      const brand = document.querySelector<HTMLElement>("header a[href='#top']");
      const nr = name.getBoundingClientRect();
      const br = brand?.getBoundingClientRect();
      const geo = { ...pill };
      const tl = gsap.timeline({ onComplete: cleanup });
      tl.to(root.querySelectorAll("[data-chrome]"), { opacity: 0, duration: 0.3 }, 0)
        .set(root.querySelector("[data-backdrop]"), { opacity: 0 }, 0)
        .to(geo, { ...frame, duration: 0.9, ease: "expo.inOut", onUpdate: () => setGeo(geo) }, 0)
        .to(root.querySelector("[data-fill]"), { opacity: 0, duration: 0.9, ease: "expo.inOut" }, 0);
      if (br) {
        tl.to(
          name,
          {
            x: br.left + br.width / 2 - (nr.left + nr.width / 2),
            y: br.top + br.height / 2 - (nr.top + nr.height / 2),
            scale: br.height / nr.height,
            duration: 0.9,
            ease: "expo.inOut",
          },
          0,
        );
      }
      // Then the ring fades and the frame goes full-bleed.
      tl.to([root.querySelector("[data-outside]"), ringRef.current, name], { opacity: 0, duration: 0.4 }, 0.9);
    };

    const finish = () => {
      if (finishing) return;
      finishing = true;
      if (!shown) {
        // Loaded before the loader ever appeared: no animation at all.
        gsap.ticker.remove(tick);
        cleanup();
        return;
      }
      const wait = Math.max(0, SHOW_AFTER + MIN_SHOWN - (performance.now() - start));
      gsap.delayedCall(wait / 1000, () => {
        display = 1;
        paint(1);
        setStatus("Page loaded");
        root.setAttribute("data-complete", "");
        gsap.delayedCall(0.3 + 0.3, () => reveal());
      });
    };

    function tick() {
      const elapsed = performance.now() - start;
      if (!shown && elapsed >= SHOW_AFTER) shown = true;
      // Eased toward real progress (lerp 0.12/frame); a slow time floor keeps it moving.
      const real = loadProgress();
      const target = Math.max(real, Math.min(0.9, (elapsed / HARD_CAP) * 0.9));
      if (!finishing) {
        display = Math.max(display, display + (target - display) * 0.12);
        paint(Math.min(display, 0.99));
      }
      if (!finishing && (real >= 1 || elapsed >= HARD_CAP)) finish();
    }

    skipRef.current = () => {
      if (finishing && root.hasAttribute("data-complete")) return;
      finishing = true;
      reveal(true);
    };

    paint(0);
    gsap.ticker.add(tick);

    return () => {
      cancelAnimationFrame(announce);
      gsap.ticker.remove(tick);
      page.forEach((el) => (el.inert = false));
    };
  }, []);

  if (!active) return null;

  const [first, ...rest] = person.name.split(" ");
  return (
    <div ref={rootRef} className={s.loader}>
      <div className={s.backdrop} data-backdrop aria-hidden="true" />
      <svg ref={svgRef} className={s.svg} aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="#fff" />
            <rect data-shape fill="#000" />
          </mask>
        </defs>
        <rect data-outside width="100%" height="100%" fill="#000" mask={`url(#${maskId})`} />
        <rect data-shape data-fill fill="#000" />
        <g className={s.fadeIn}>
          <rect data-shape data-chrome fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
          <rect
            ref={ringRef}
            data-shape
            className={s.ring}
            fill="none"
            stroke="#5b9cff"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="0 100"
          />
        </g>
      </svg>
      <div className={`${s.grain} grain`} aria-hidden="true" />

      <div ref={nameRef} className={`${s.name} ${s.fadeIn}`} aria-hidden="true">
        <span>{first}</span> <span>{rest.join(" ")}</span>
      </div>

      <div className={`${s.progress} ${s.fadeIn}`} data-chrome aria-hidden="true">
        <span ref={dotsRef} className={s.dots}>
          {Array.from({ length: DOTS }, (_, i) => (
            <span key={i} />
          ))}
        </span>
        <span ref={counterRef} className={s.counter}>
          LOADING · 0%
        </span>
      </div>

      <span ref={noteRef} className={`${s.note} ${s.fadeIn}`} data-chrome aria-hidden="true">
        Preparing an accessible experience
      </span>
      <span className={`${s.role} ${s.fadeIn}`} data-chrome aria-hidden="true">
        {person.role}
      </span>

      <button type="button" className={`${s.skip} ${s.fadeIn}`} data-chrome onClick={() => skipRef.current()}>
        Skip intro
      </button>

      <p role="status" className="sr-only">
        {status}
      </p>
    </div>
  );
}
