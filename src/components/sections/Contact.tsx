"use client";

import { useRef } from "react";
import { links } from "@/content/site";
import { gsap, ease } from "@/lib/gsap";
import { magnetic } from "@/lib/magnetic";
import { scrollOnFocus, useMotion, useSectionMotion } from "@/lib/motion";
import { cue } from "@/lib/sound";
import { VisitSummary } from "../features/Extras";
import { Laptop } from "../Laptop";
import s from "./Contact.module.css";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useMotion();

  useSectionMotion(ref, (mode) => {
    if (mode === "reduced") return;
    const q = gsap.utils.selector(ref.current);
    // Magnetic CTAs (spec 11.9): fine pointers only.
    const offMagnetic = matchMedia("(hover: hover) and (pointer: fine)").matches
      ? magnetic(q(`.${s.pin}`)[0] as HTMLElement)
      : null;
    const laptop = q("[data-laptop]")[0];

    if (mode === "mobile") {
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: laptop, start: "top 85%", end: "bottom 35%", scrub: 0.8 },
        })
        .fromTo(laptop, { "--open": 1, "--glow": 0.7 }, { "--open": 0, "--glow": 0.2, duration: 0.85 }, 0)
        .fromTo(laptop, { "--seam": 0 }, { "--seam": 1, duration: 0.08 }, 0.85)
        .to(laptop, { "--seam": 0.6, duration: 0.07 }, 0.93);
      return () => offMagnetic?.();
    }

    // Headline + buttons rise in as the section arrives, then stay put.
    const rise = gsap.fromTo(
      q(`.${s.title}, .${s.actions}`),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: ease.expo,
        scrollTrigger: { trigger: ref.current, start: "top 75%", end: "top 15%", scrub: 0.8 },
      },
    );

    // full: pinned 150%; the lid closes and the page ends on frame 1a.
    let lastP = 0;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: q(`.${s.pin}`)[0],
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          // Sound cue as the lid passes half-closed.
          if (self.direction > 0 && self.progress > 0.55 && lastP <= 0.55) cue("lid-close");
          lastP = self.progress;
        },
      },
    });
    // Final 10%: lid shut, light leaks through the hinge seam (v2 frame 8b).
    tl.fromTo(laptop, { "--open": 1, "--glow": 0.7 }, { "--open": 0, "--glow": 0.2, duration: 0.7, ease: ease.power3 }, 0.2)
      .fromTo(laptop, { "--seam": 0 }, { "--seam": 1, duration: 0.05 }, 0.9)
      .to(laptop, { "--seam": 0.6, duration: 0.05 }, 0.95);

    // Focusing a button before it has fully risen in jumps to the pin start.
    const st = tl.scrollTrigger!;
    const offFocus = scrollOnFocus(ref.current!, st, () => ((rise.scrollTrigger?.progress ?? 1) < 1 ? 0 : null), scrollTo);

    // Cursor light (v2 §9) — fine pointers only.
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return () => {
        offFocus();
        offMagnetic?.();
      };
    }
    const pin = q(`.${s.pin}`)[0] as HTMLElement;
    const light = q(`.${s.cursorLight}`)[0];
    const xTo = gsap.quickTo(light, "x", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(light, "y", { duration: 0.8, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const r = pin.getBoundingClientRect();
      gsap.to(light, { opacity: 1, duration: 0.4, overwrite: "auto" });
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    const onLeave = () => gsap.to(light, { opacity: 0, duration: 0.6 });
    pin.addEventListener("pointermove", onMove);
    pin.addEventListener("pointerleave", onLeave);
    return () => {
      offFocus();
      offMagnetic?.();
      pin.removeEventListener("pointermove", onMove);
      pin.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <section ref={ref} id="contact" className={`${s.section} grain`} aria-labelledby="contact-title">
      <div className={s.pin}>
        <div className={s.cursorLight} aria-hidden="true" />
        <h2 id="contact-title" className={s.title} tabIndex={-1}>
          Let&rsquo;s build something <span className="gradient-text">everyone</span> can use.
        </h2>
        <ul className={s.actions}>
          <li>
            <a className={`btn btn-cta ${s.btn}`} href={links.email} data-magnetic>
              <span data-magnetic-label>Email me</span>
            </a>
          </li>
          <li>
            <a className={`btn btn-secondary ${s.btn}`} href={links.linkedin} target="_blank" rel="noopener noreferrer" data-magnetic>
              <span data-magnetic-label>
                LinkedIn <span aria-hidden="true">↗</span>
              </span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
          <li>
            <a className={`btn btn-secondary ${s.btn}`} href={links.github} target="_blank" rel="noopener noreferrer" data-magnetic>
              <span data-magnetic-label>
                GitHub <span aria-hidden="true">↗</span>
              </span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
          <li>
            <a className={`btn btn-secondary ${s.btn}`} href={links.cv} download data-magnetic>
              <span data-magnetic-label>{links.cvLabel}</span>
              <span className="sr-only">{` (${links.cvMeta})`}</span>
            </a>
          </li>
        </ul>
        <div className={s.laptop}>
          <Laptop />
        </div>
        <div className={s.summary}>
          <VisitSummary />
        </div>
      </div>
    </section>
  );
}
