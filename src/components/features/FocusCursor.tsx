"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import s from "./features.module.css";

const INTERACTIVE = "a[href], button, [role='switch'], [role='slider'], input, summary";

/**
 * Focus-ring cursor (Developer Spec §11.4, P2). A 28px ring trails the
 * pointer; over links and buttons it wraps the element like a focus ring.
 * Additive only — the native cursor stays. Fine pointer, not in reduced
 * motion or forced-colors mode.
 */
export function FocusCursor() {
  const { mode } = useMotion();
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || !mode || mode === "reduced") return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(forced-colors: active)").matches) return;

    const to = (prop: string) => gsap.quickTo(ring, prop, { duration: 0.25, ease: "power3" });
    const x = to("x");
    const y = to("y");
    const w = to("width");
    const h = to("height");
    const r = to("borderRadius");
    let target: HTMLElement | null = null;
    let px = -100;
    let py = -100;

    const update = () => {
      if (target && target.isConnected) {
        const rect = target.getBoundingClientRect();
        const radius = parseFloat(getComputedStyle(target).borderRadius) || 6;
        x(rect.left - 6);
        y(rect.top - 6);
        w(rect.width + 12);
        h(rect.height + 12);
        r(Math.min(radius + 6, (rect.height + 12) / 2));
      } else {
        x(px - 14);
        y(py - 14);
        w(28);
        h(28);
        r(14);
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      target = (e.target as Element).closest<HTMLElement>(INTERACTIVE);
      ring.dataset.active = "";
      ring.toggleAttribute("data-target", !!target);
      update();
    };
    const onLeave = () => delete ring.dataset.active;
    const onScroll = () => target && update();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      delete ring.dataset.active;
    };
  }, [mode]);

  return <div ref={ringRef} className={s.cursorRing} aria-hidden="true" data-feature-ui />;
}
