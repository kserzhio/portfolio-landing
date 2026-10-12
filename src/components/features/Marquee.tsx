"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion, useSectionMotion } from "@/lib/motion";
import s from "./features.module.css";

const TEXT = "WCAG 2.2 · ARIA · Section 508 · NVDA · JAWS · VoiceOver · axe · ANDI · ";

/**
 * Scroll-speed marquee (Developer Spec §11.10, P2) between Certification and
 * Stack. Slow base speed; scroll velocity speeds it up (×1–6) and flips its
 * direction with the scroll direction. Decorative (terms are listed in §6),
 * pauses with the global Pause motion, static in reduced mode.
 */
export function Marquee() {
  const ref = useRef<HTMLElement>(null);
  const { paused } = useMotion();
  const loop = useRef<gsap.core.Tween | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    loop.current?.paused(paused);
  }, [paused]);

  useSectionMotion(ref, (mode) => {
    if (mode === "reduced") return;
    const track = ref.current!.querySelector(`.${s.marqueeTrack}`)!;
    const tween = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    // Start deep into the repeats so a negative timeScale can play backwards.
    tween.totalTime(tween.duration() * 500);
    loop.current = tween;
    if (pausedRef.current) tween.pause();
    let dir = 1;
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        dir = self.direction;
        const speed = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
        gsap.to(tween, { timeScale: speed * dir, duration: 0.1, overwrite: true });
        // Decay back to base speed in 0.5s, keeping the latest direction.
        gsap.to(tween, { timeScale: dir, duration: 0.5, delay: 0.1, ease: "power1.out" });
      },
    });
    return () => {
      st.kill();
      loop.current = null;
    };
  });

  return (
    <section ref={ref} className={`${s.marquee} grain`} aria-hidden="true">
      <div className={s.marqueeTrack}>
        <span>{TEXT.repeat(2)}</span>
        <span>{TEXT.repeat(2)}</span>
      </div>
    </section>
  );
}
