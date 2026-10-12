"use client";

import { useRef } from "react";
import { featuredCert, links, otherCerts } from "@/content/site";
import { gsap, ease } from "@/lib/gsap";
import { useSectionMotion } from "@/lib/motion";
import s from "./Certification.module.css";

export function Certification() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, (mode) => {
    if (mode !== "full") return;
    const section = ref.current!;
    const q = gsap.utils.selector(section);
    const tilt = q(`.${s.tilt}`)[0];
    const card = q(`.${s.card}`)[0];

    // Scroll tilt + sheen (Developer Spec §5).
    gsap
      .timeline({ scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 } })
      .fromTo(tilt, { rotationX: 14, rotationY: -18 }, { rotationX: -8, rotationY: 8, ease: "none" }, 0)
      .fromTo(q(`.${s.sheen}`), { xPercent: -100 }, { xPercent: 200, ease: "none" }, 0);

    // Holographic film: conic angle bound to the card's total rotateY (210° ± 60°).
    const holo = q(`.${s.holo}`)[0] as HTMLElement;
    const syncHolo = () => {
      const ry = Number(gsap.getProperty(tilt, "rotationY")) + Number(gsap.getProperty(card, "rotationY"));
      holo.style.setProperty("--holo", String(210 + gsap.utils.clamp(-60, 60, ry * (60 / 18))));
    };
    gsap.ticker.add(syncHolo);

    gsap.from(q(`.${s.other} li`), {
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: ease.expo,
      scrollTrigger: { trigger: q(`.${s.other}`)[0], start: "top 85%", once: true },
    });

    // Pointer tilt adds ±10° on fine pointers only.
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => gsap.ticker.remove(syncHolo);
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 20);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 20);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      gsap.ticker.remove(syncHolo);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <section ref={ref} id="certification" className={`${s.section} grain`} aria-labelledby="cert-title">
      <div className={s.top}>
        <div className={s.copy}>
          <p className="eyebrow">Certification</p>
          <h2 id="cert-title" className={s.title} tabIndex={-1}>
            {featuredCert.title}
          </h2>
          <p className={s.issuer}>{featuredCert.issuer}</p>
          <p className={s.text}>{featuredCert.text}</p>
          <a className={s.verify} href={links.credential} target="_blank" rel="noopener noreferrer">
            Verify credential <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>

        <div className={s.visual}>
          <div className={s.glow} aria-hidden="true" />
          <div className={s.persp}>
            <div className={s.tilt}>
              <div className={s.card}>
                <div className={s.sheen} aria-hidden="true" />
                <div className={s.holo} aria-hidden="true" />
                <div className={s.cardTop}>
                  {/* Typographic placeholder — not the official DHS mark. */}
                  <span className={s.seal} aria-hidden="true">
                    issuer
                    <br />
                    mark
                  </span>
                  <span className={s.cardTag}>SECTION 508</span>
                </div>
                <span className={`${s.cardKicker} gradient-text`}>TRUSTED TESTER™</span>
                <span className={s.cardTitle}>Certified Trusted Tester</span>
                <span className={s.cardSub}>ICT Testing Baseline · DHS process</span>
                <span className={s.cardMeta}>
                  <span>ID {featuredCert.id}</span>
                  <span>Issued {featuredCert.issued}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="sr-only">Other certificates</h3>
      <ul className={s.other}>
        {otherCerts.map((c) => (
          <li key={c.title} className={s.otherCard}>
            <span className={s.otherIcon} aria-hidden="true" />
            <span className={s.otherText}>
              <b>{c.title}</b>
              <span>{c.meta}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
