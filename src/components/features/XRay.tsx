"use client";

import { useEffect, useRef } from "react";
import { collect, focusOrder, inViewport, type A11yNode } from "@/lib/a11yTree";
import { useFeatures } from "@/lib/features";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import s from "./features.module.css";

const tagFor = (n: A11yNode) => {
  if (n.kind === "heading") return `H${n.level}`;
  const name = n.name.length > 40 ? n.name.slice(0, 38) + "…" : n.name;
  return name ? `${n.role} · “${name}”` : n.role;
};

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Site-wide X-ray (Developer Spec §11.3, P1). Overlays this page's real
 * accessibility structure — landmark outlines, heading levels, role + name
 * pills and focus-order numerals — in the visual language of chapter 04.
 * The overlay is aria-hidden; the same data is downloadable as a report.
 */
export function XRay() {
  const { xray } = useFeatures();
  const { mode } = useMotion();
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!xray) return;
    const layer = layerRef.current!;
    let dirty = true;
    let intro = mode !== "reduced";

    const draw = () => {
      if (!dirty) return;
      dirty = false;
      const order = focusOrder();
      const nodes = collect(document).filter((n) => !n.el.closest("[data-feature-ui]") && inViewport(n.el));
      let html = "";
      nodes.slice(0, 80).forEach((n, i) => {
        const r = n.el.getBoundingClientRect();
        const delay = intro ? `animation-delay:${i * 15}ms;` : "";
        const box = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
        html += `<span class="${s.xBox}" data-kind="${n.kind}" style="${box}${delay}"></span>`;
        const label = tagFor(n);
        const lx = Math.max(4, Math.min(innerWidth - 220, n.kind === "heading" ? r.right + 8 : r.left + (n.kind === "landmark" ? 16 : 0)));
        const ly = Math.max(64, n.kind === "landmark" ? r.top - 10 : n.kind === "heading" ? r.top + 4 : r.top - 24);
        // Control pills never get wider than their element (+ a little), so rows of links don't collide.
        const maxW = n.kind === "control" ? `max-width:${Math.max(56, r.width + 8)}px;` : "";
        html += `<span class="${s.xTag}" data-kind="${n.kind}" style="left:${lx}px;top:${ly}px;${maxW}${delay}">${esc(label)}</span>`;
        const idx = order.indexOf(n.el);
        if (n.kind === "control" && idx >= 0) {
          html += `<span class="${s.xNum}" style="left:${r.left - 14}px;top:${r.top - 14}px;${delay}">${idx + 1}</span>`;
        }
      });
      layer.innerHTML = html;
      if (intro) {
        layer.dataset.intro = "";
        intro = false;
      } else delete layer.dataset.intro;
    };

    const mark = () => (dirty = true);
    // Pinned sections animate under scroll, so redraw on every scrolled frame.
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
    const ro = new ResizeObserver(mark);
    ro.observe(document.body);
    const refresh = window.setInterval(mark, 500);
    gsap.ticker.add(draw);

    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener("scroll", mark);
      window.removeEventListener("resize", mark);
      ro.disconnect();
      window.clearInterval(refresh);
      layer.innerHTML = "";
    };
  }, [xray, mode]);

  if (!xray) return null;
  return <div ref={layerRef} className={s.xLayer} aria-hidden="true" data-feature-ui />;
}

/** "Download this site's a11y report" — generated from the live DOM. */
export function downloadA11yReport() {
  const nodes = collect(document).filter((n) => !n.el.closest("[data-feature-ui]"));
  const report = {
    page: location.href,
    generated: new Date().toISOString(),
    landmarks: nodes.filter((n) => n.kind === "landmark").map((n) => ({ role: n.role, name: n.name })),
    headings: nodes.filter((n) => n.kind === "heading").map((n) => ({ level: n.level, text: n.name })),
    focusOrder: focusOrder().map((el, i) => {
      const n = nodes.find((x) => x.el === el);
      return { stop: i + 1, role: n?.role ?? el.tagName.toLowerCase(), name: n?.name ?? "" };
    }),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "serhii-kostenko-a11y-report.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
