"use client";

import { useEffect, useRef, useState } from "react";
import { chapters, fixes, stack } from "@/content/site";
import { ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import s from "./features.module.css";

type Screen = { title: string; lines: { t: string; c?: string }[] };
const BLUE = "#7cc4ff";
const VIOLET = "#c4a7ff";
const GREEN = "#9be3b0";
const GRAY = "#8a8a96";
export const FIX_EVENT = "portfolio:fixed";
const HIDDEN_KEY = "companion-hidden";

function screenFor(section: string, chapter: number, fixed: number): Screen | null {
  switch (section) {
    case "about":
      return { title: "about.md", lines: [{ t: "# Serhii Kostenko", c: BLUE }, { t: "10+ years · UI" }, { t: "now: accessibility", c: GREEN }] };
    case "journey": {
      const c = chapters[chapter];
      return {
        title: `chapter-${c.index.slice(0, 2)}.json`,
        lines: [{ t: `"${c.year.replace(/[[\]]/g, "")}"`, c: GREEN }, ...c.tags.slice(0, 6).map((t) => ({ t: `· ${t}`, c: VIOLET }))],
      };
    }
    case "accessibility":
      return {
        title: "audit.log",
        lines: [
          { t: `fixed ${fixed} / ${fixes.length}`, c: fixed === fixes.length ? GREEN : BLUE },
          ...fixes.map((f, i) => ({ t: `${i < fixed ? "✓" : "·"} ${f.short}`, c: i < fixed ? GREEN : GRAY })),
        ],
      };
    case "certification":
      return { title: "cert.txt", lines: [{ t: "DHS Trusted Tester", c: BLUE }, { t: "Section 508" }, { t: "ICT Baseline", c: VIOLET }] };
    case "stack":
      return { title: "stack.ts", lines: stack.map((c) => ({ t: `${c.name}: ${c.items.length}`, c: VIOLET })) };
    default:
      return null;
  }
}

/**
 * Companion laptop (Developer Spec §11.8, P2). After the hero a small laptop
 * docks bottom-right and its screen follows the page: the current journey
 * chapter's stack, the live fix count, the stack. Hidden below 1280px, near
 * the contact section and whenever it would cover text. Decorative; has a
 * "Hide laptop" button.
 */
export function Companion() {
  const { mode } = useMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Restore "Hide laptop" for this visit (after mount: no hydration mismatch).
    const id = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem(HIDDEN_KEY)) setDismissed(true);
      } catch {
        /* storage unavailable */
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!mode || dismissed || !root || !canvas) return;
    if (!matchMedia("(min-width: 1280px)").matches) return;

    let disposed = false;
    let scene: ReturnType<typeof import("../laptop3d").createLaptopScene> | null = null;
    let section = "";
    let chapter = 0;
    let fixed = 0;
    let inRange = false;
    let covering = false;
    const triggers: ScrollTrigger[] = [];

    const paint = () => {
      if (!scene) return;
      scene.setScreen(screenFor(section, chapter, fixed));
      scene.render({ open: 1, lines: 6, glow: 0.6, seam: 0 });
    };
    const visible = () => {
      const show = inRange && !covering && !!screenFor(section, chapter, fixed);
      root.toggleAttribute("data-shown", show);
    };

    // Active section / journey chapter.
    ["about", "journey", "accessibility", "certification", "stack"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) section = id;
            paint();
            visible();
          },
        }),
      );
    });
    const hero = document.querySelector("main > section");
    const contact = document.getElementById("contact");
    if (hero && contact) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "bottom 60%",
          endTrigger: contact,
          end: "top 80%",
          refreshPriority: -1,
          onToggle: (self) => {
            inRange = self.isActive;
            visible();
          },
        }),
      );
    }
    const onFix = (e: Event) => {
      fixed = (e as CustomEvent<number>).detail;
      paint();
    };
    window.addEventListener(FIX_EVENT, onFix);

    // Hide when it would cover text: probe what's under its corners.
    const probe = () => {
      const r = root.getBoundingClientRect();
      const pts = [
        [r.left + 8, r.top + 8],
        [r.right - 8, r.top + 8],
        [r.left + 8, r.bottom - 8],
        [r.left + r.width / 2, r.top + r.height / 2],
      ];
      root.style.visibility = "hidden";
      const hit = pts.some(([x, y]) => {
        const el = document.elementFromPoint(x, y);
        return !!el && !!el.closest("p, h1, h2, h3, li, button, a, figure, dl, input, pre");
      });
      root.style.visibility = "";
      if (hit !== covering) {
        covering = hit;
        visible();
      }
    };
    const onScroll = () => {
      const st = document.querySelector("#journey nav [aria-current='step']");
      const idx = st ? [...st.closest("ol")!.querySelectorAll("button")].indexOf(st as HTMLButtonElement) : 0;
      if (idx >= 0 && idx !== chapter) {
        chapter = idx;
        paint();
      }
    };
    let probeTimer = 0;
    const onScrollAll = () => {
      onScroll();
      window.clearTimeout(probeTimer);
      probeTimer = window.setTimeout(probe, 120);
    };
    window.addEventListener("scroll", onScrollAll, { passive: true });

    import("../laptop3d").then((mod) => {
      if (disposed) return;
      try {
        scene = mod.createLaptopScene(canvas);
      } catch {
        return;
      }
      scene.resize(root.clientWidth, root.clientHeight, Math.min((devicePixelRatio || 1) * 1.5, 3));
      document.fonts?.ready.then(paint);
      paint();
    });

    return () => {
      disposed = true;
      triggers.forEach((t) => t.kill());
      window.removeEventListener(FIX_EVENT, onFix);
      window.removeEventListener("scroll", onScrollAll);
      window.clearTimeout(probeTimer);
      scene?.dispose();
      root.removeAttribute("data-shown");
    };
  }, [mode, dismissed]);

  if (dismissed) return null;
  return (
    <div ref={rootRef} className={s.companion} data-feature-ui>
      <canvas ref={canvasRef} className={s.companionCanvas} aria-hidden="true" />
      <button
        type="button"
        className={s.companionHide}
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(HIDDEN_KEY, "1");
          } catch {
            /* storage unavailable */
          }
        }}
      >
        Hide laptop
      </button>
    </div>
  );
}
