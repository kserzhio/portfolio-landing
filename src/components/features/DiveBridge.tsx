"use client";

import { useRef } from "react";
import { gsap, ease } from "@/lib/gsap";
import { useSectionMotion } from "@/lib/motion";
import { Laptop } from "../Laptop";
import s from "./DiveBridge.module.css";

// The next section as markup (mockups 3f / 3g). Indent in ch; scatter =
// [x px, rotate deg, opacity, blur px] at the start of phase B.
type Tok = [string, "p" | "t" | "a" | "s" | "x"];
const LINES: { indent: number; scatter: [number, number, number, number]; toks: Tok[] }[] = [
  { indent: 0, scatter: [-60, -2, 1, 0], toks: [["<", "p"], ["section ", "t"], ["aria-labelledby", "a"], ["=", "p"], ['"ba-title"', "s"], [">", "p"]] },
  { indent: 2, scatter: [140, 1.5, 1, 0], toks: [["<", "p"], ["h2 ", "t"], ["id", "a"], ["=", "p"], ['"ba-title"', "s"], [">", "p"], ["Watch a form become usable.", "x"], ["</", "p"], ["h2", "t"], [">", "p"]] },
  { indent: 2, scatter: [-200, -3, 0.7, 2], toks: [["<", "p"], ["figure", "t"], [">", "p"]] },
  { indent: 4, scatter: [90, 2, 1, 0], toks: [["<", "p"], ["label ", "t"], ["for", "a"], ["=", "p"], ['"email"', "s"], [">", "p"], ["Email address", "x"], ["</", "p"], ["label", "t"], [">", "p"]] },
  { indent: 4, scatter: [-30, -1, 1, 0], toks: [["<", "p"], ["input ", "t"], ["id", "a"], ["=", "p"], ['"email"', "s"], [" type", "a"], ["=", "p"], ['"email"', "s"], [" required", "a"], [">", "p"]] },
  { indent: 4, scatter: [220, 3, 0.8, 1.5], toks: [["<", "p"], ["input ", "t"], ["id", "a"], ["=", "p"], ['"pw"', "s"], [" aria-invalid", "a"], ["=", "p"], ['"true"', "s"]] },
  { indent: 6, scatter: [-120, -2.5, 0.6, 2.5], toks: [["aria-describedby", "a"], ["=", "p"], ['"pw-error"', "s"], [">", "p"]] },
  { indent: 4, scatter: [40, 1, 1, 0], toks: [["<", "p"], ["p ", "t"], ["id", "a"], ["=", "p"], ['"pw-error"', "s"], [">", "p"], ["Password must be at least 12 characters.", "x"], ["</", "p"], ["p", "t"], [">", "p"]] },
  { indent: 4, scatter: [-90, -1.5, 0.9, 0], toks: [["<", "p"], ["button ", "t"], ["type", "a"], ["=", "p"], ['"submit"', "s"], [">", "p"], ["Create account", "x"], ["</", "p"], ["button", "t"], [">", "p"]] },
  { indent: 2, scatter: [180, 2.5, 0.5, 3], toks: [["</", "p"], ["figure", "t"], [">", "p"]] },
];
const COLORS = { p: "#8a8a96", t: "#7cc4ff", a: "#c4a7ff", s: "#9be3b0", x: "#f5f5f7" };

/**
 * "Dive into the code" (Developer Spec §11.5, mockups 3e → 3f → 3g): a pinned
 * bridge between Journey and Before / After.
 *   A · the laptop scales up until its screen fills the viewport, vignette closes in
 *   B · the screen dissolves into the next section's markup — scattered, rotated,
 *       depth-blurred lines drift into alignment
 *   C · lines snap into place and a light circle wipe reveals section 4
 * Decorative (aria-hidden); full-motion mode only — reduced / mobile get a plain break.
 */
export function DiveBridge() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, (mode) => {
    if (mode !== "full") return;
    const q = gsap.utils.selector(ref.current);
    const pin = q(`.${s.pin}`)[0] as HTMLElement;
    const lines = q(`.${s.line}`) as HTMLElement[];
    const radius = () => Math.hypot(innerWidth, innerHeight) / 2 + 40;

    gsap.set(lines, {
      x: (i) => LINES[i].scatter[0],
      rotation: (i) => LINES[i].scatter[1],
      opacity: 0,
      filter: (i) => `blur(${LINES[i].scatter[3]}px)`,
    });

    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: pin, start: "top top", end: "+=150%", pin: true, scrub: 0.8, invalidateOnRefresh: true },
      })
      // A · camera enters the screen
      .fromTo(q(`.${s.laptop}`), { scale: 1 }, { scale: 3.4, duration: 0.36, ease: ease.power3 }, 0)
      .fromTo(q(`.${s.vignette}`), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.06)
      // B · the page as markup
      .to(q(`.${s.laptop}`), { opacity: 0, duration: 0.1 }, 0.3)
      .fromTo(q(`.${s.markupBg}`), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.3)
      .to(lines, { opacity: (i) => LINES[i].scatter[2], duration: 0.08, stagger: 0.006 }, 0.32)
      .to(lines, { x: 0, rotation: 0, opacity: 1, filter: "blur(0px)", duration: 0.26, stagger: 0.008, ease: ease.expo }, 0.4)
      // C · markup reassembles, circle wipe into section 4
      .to(q(`.${s.code}`), { opacity: 0.35, duration: 0.08 }, 0.68)
      // --r lives on the pin so the wipe and its glowing edge stay in sync.
      .fromTo(pin, { "--r": "0px" }, { "--r": () => `${radius()}px`, duration: 0.3, ease: "power2.in" }, 0.7)
      .to(q(`.${s.ring}`), { opacity: 0, duration: 0.05 }, 0.95);
  });

  return (
    <section ref={ref} className={s.dive} aria-hidden="true">
      <div className={s.pin}>
        <div className={s.laptop}>
          <Laptop oversample={4} />
        </div>
        <div className={s.vignette} />
        <div className={s.markupBg} />
        <div className={s.code}>
          {LINES.map((ln, i) => (
            <div key={i} className={s.line} style={{ paddingLeft: `${ln.indent}ch` }}>
              {ln.toks.map(([t, c], j) => (
                <span key={j} style={{ color: COLORS[c] }}>
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className={s.wipe}>
          <div className={s.preview}>
            <span className={s.eyebrow}>BEFORE / AFTER</span>
            <span className={s.title}>Watch a form become usable.</span>
            <div className={s.card}>
              <span className={s.cardTitle}>Create account</span>
              <span className={s.cardLabel} style={{ marginTop: 20 }}>
                Email address
              </span>
              <span className={s.cardField} />
              <span className={s.cardLabel}>Password</span>
              <span className={s.cardField} />
              <span className={s.cardButton} />
            </div>
          </div>
        </div>
        <span className={s.ring} />
      </div>
    </section>
  );
}
