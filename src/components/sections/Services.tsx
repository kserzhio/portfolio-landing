"use client";

import { useRef } from "react";
import { services } from "@/content/site";
import { gsap, ease } from "@/lib/gsap";
import { useSectionMotion } from "@/lib/motion";
import s from "./Services.module.css";

const OFFSETS = [120, 180, 260]; // parallax 1.0 / 1.1 / 1.25 (Developer Spec §4d)

export function Services() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, (mode) => {
    if (mode === "reduced") return;
    const q = gsap.utils.selector(ref.current);
    const cards = q(`.${s.card}`);
    if (mode === "mobile") {
      cards.forEach((card) =>
        gsap.from(card, { y: 30, opacity: 0, duration: 0.6, ease: ease.expo, scrollTrigger: { trigger: card, start: "top 88%", once: true } }),
      );
      return;
    }
    cards.forEach((card, i) =>
      gsap.fromTo(
        card,
        { y: OFFSETS[i] ?? 120 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: q(`.${s.cards}`)[0], start: "top bottom", end: "top 35%", scrub: 0.6 },
        },
      ),
    );
  });

  return (
    <section ref={ref} className={s.services} data-theme="light" aria-labelledby="services-title">
      <h2 id="services-title" className={s.title}>
        How I help teams.
      </h2>
      <p className={s.lead}>Getting accessibility into a product — and keeping it there.</p>
      <ol className={s.cards}>
        {services.map((sv, i) => (
          <li key={sv.title} className={s.card}>
            <span className={s.num} aria-hidden="true">
              0{i + 1}
            </span>
            <h3 className={s.cardTitle}>{sv.title}</h3>
            <p className={s.text}>{sv.text}</p>
            <ul className={`pills ${s.tags}`} aria-label="Tools and deliverables">
              {sv.tags.map((t) => (
                <li key={t} className="pill pill-light">
                  {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
