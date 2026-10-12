"use client";

import { useEffect, useRef, useState } from "react";
import { useFeatures, VISION_MODES, type VisionMode } from "@/lib/features";

const SHORT: Record<string, string> = {
  protanopia: "Protan",
  deuteranopia: "Deutan",
  tritanopia: "Tritan",
  "low-vision": "Low vision",
  cataract: "Cataract",
};
const LENS = 420;
import { gsap } from "@/lib/gsap";
import s from "./features.module.css";

// Colour-vision matrices (Machado-style approximations).
const MATRICES: Record<"protanopia" | "deuteranopia" | "tritanopia", string> = {
  protanopia: "0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0",
  deuteranopia: "0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0",
  tritanopia: "0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0",
};

export function filterFor(mode: VisionMode): string {
  switch (mode) {
    case "protanopia":
    case "deuteranopia":
    case "tritanopia":
      return `url(#vs-${mode})`;
    case "low-vision":
      return "blur(3px) contrast(0.6) brightness(0.95)";
    case "cataract":
      return "url(#vs-cataract) blur(2px) contrast(0.8)";
    default:
      return "none";
  }
}

const supportsBackdropUrl = () =>
  typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#vs-protanopia)");

/** Hidden SVG filter definitions used by the simulator. */
function Filters() {
  return (
    <svg className={s.svgDefs} aria-hidden="true" focusable="false">
      {Object.entries(MATRICES).map(([id, values]) => (
        <filter id={`vs-${id}`} key={id} colorInterpolationFilters="linearRGB">
          <feColorMatrix type="matrix" values={values} />
        </filter>
      ))}
      <filter id="vs-cataract">
        <feColorMatrix type="matrix" values="0.9 0.1 0.05 0 0.06  0.08 0.85 0.05 0 0.05  0.05 0.08 0.6 0 0.02  0 0 0 1 0" />
      </filter>
    </svg>
  );
}

/**
 * Vision simulation lens (Developer Spec §11.2, P2). A 220px lens follows a
 * fine pointer and shows the page as seen with a vision condition; keys 1–5
 * switch modes, 0 / Esc turns it off. Keyboard / touch alternative: the same
 * filter applied to the whole viewport (picked from the header menu).
 */
export function VisionSim() {
  const { vision, setVision, lens } = useFeatures();
  const lensRef = useRef<HTMLDivElement>(null);
  const [canLens, setCanLens] = useState(false);

  useEffect(() => {
    // Feature detection after mount; the lens needs a fine pointer and backdrop url() filters.
    const ok = matchMedia("(hover: hover) and (pointer: fine)").matches && supportsBackdropUrl();
    const id = requestAnimationFrame(() => setCanLens(ok));
    return () => cancelAnimationFrame(id);
  }, []);

  const useLens = lens && canLens;

  useEffect(() => {
    if (vision === "off") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "Escape" || e.key === "0") setVision("off");
      const n = Number(e.key);
      if (n >= 1 && n <= VISION_MODES.length) setVision(VISION_MODES[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [vision, setVision]);

  useEffect(() => {
    if (vision === "off" || !useLens) return;
    const el = lensRef.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.15, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.15, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX - LENS / 2);
      yTo(e.clientY - LENS / 2);
    };
    gsap.set(el, { x: innerWidth / 2 - LENS / 2, y: innerHeight / 2 - LENS / 2 });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [vision, useLens]);

  const index = VISION_MODES.findIndex((m) => m.id === vision);
  const label = VISION_MODES[index]?.label;
  const filter = filterFor(vision);

  return (
    <>
      <Filters />
      {vision !== "off" && useLens && (
        <div ref={lensRef} className={s.lens} style={{ backdropFilter: filter, WebkitBackdropFilter: filter }} aria-hidden="true" inert data-feature-ui>
          <span className={s.lensLabel}>
            <kbd>{index + 1}</kbd>
            {label}
          </span>
        </div>
      )}
      {vision !== "off" && !useLens && (
        <div className={s.visionFull} style={supportsBackdropUrl() ? { backdropFilter: filter, WebkitBackdropFilter: filter } : undefined} aria-hidden="true" inert data-feature-ui>
          <span className={s.visionBadge}>Simulating: {label} · Esc to stop</span>
        </div>
      )}
      {vision !== "off" && (
        <div className={s.modeBar} role="group" aria-label="Vision simulation mode" data-feature-ui>
          {VISION_MODES.map((m, i) => (
            <button key={m.id} type="button" aria-pressed={vision === m.id} onClick={() => setVision(m.id)}>
              <kbd aria-hidden="true">{i + 1}</kbd>
              {SHORT[m.id]}
            </button>
          ))}
          <button type="button" onClick={() => setVision("off")} aria-label="Turn off vision simulation">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      )}
      {/* Browsers without backdrop url() filters get the filter on <main> instead. */}
      {vision !== "off" && !useLens && !supportsBackdropUrl() && <style>{`#main{filter:${filter}}`}</style>}
    </>
  );
}
