"use client";

import { useRef } from "react";
import { counters, introText } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, ease } from "@/lib/gsap";
import { useSectionMotion } from "@/lib/motion";
import s from "./Intro.module.css";

const LIT = "#f5f5f7";

/** Visual count-up; the real value stays in the DOM for screen readers. */
function countUp(els: HTMLElement[]) {
  els.forEach((el, i) => {
    const target = Number(el.dataset.value);
    const suffix = el.dataset.suffix ?? "";
    const n = { v: 0 };
    gsap.to(n, {
      v: target,
      duration: 1.2,
      delay: i * 0.08,
      ease: ease.expo,
      onStart: () => void (el.textContent = `0${suffix}`),
      onUpdate: () => void (el.textContent = `${Math.round(n.v)}${suffix}`),
    });
  });
}

export function Intro() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, (mode) => {
    if (mode === "reduced") return;
    const q = gsap.utils.selector(ref.current);
    const statement = q(`.${s.statement}`)[0];
    const counterEls = q(`.${s.counter}`);
    const numbers = q("[data-value]") as HTMLElement[];
    const split = SplitText.create(statement, { type: "words", aria: "auto" });
    const words = split.words;

    if (mode === "mobile") {
      gsap.to(words, {
        color: LIT,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: statement, start: "top 85%", end: "bottom 45%", scrub: true },
      });
      gsap.from(counterEls, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: ease.expo,
        scrollTrigger: { trigger: q(`.${s.counters}`)[0], start: "top 85%", once: true, onEnter: () => countUp(numbers) },
      });
      return;
    }

    // full: pinned 150%, words light across 0–0.7 (Developer Spec §2)
    const wordSpan = 0.06;
    const stagger = (0.7 - wordSpan) / Math.max(1, words.length - 1);
    let counted = false;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: q(`.${s.pin}`)[0],
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: true,
        onUpdate: (st: ScrollTrigger) => {
          if (!counted && st.progress >= 0.8) {
            counted = true;
            countUp(numbers);
          }
        },
      },
    });
    tl.to(words, { color: LIT, duration: wordSpan, stagger }, 0)
      .to(statement, { y: -40, duration: 0.15 }, 0.7)
      .fromTo(counterEls, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.17, stagger: 0.04 }, 0.75);
  });

  return (
    <section ref={ref} id="about" className={`${s.intro} grain`} aria-labelledby="about-title">
      <div className={s.pin}>
        <div className={s.inner}>
          <h2 id="about-title" className={`eyebrow ${s.eyebrow}`}>
            About
          </h2>
          <p className={s.statement}>{introText}</p>
          <dl className={s.counters}>
            {counters.map((c) => (
              <div className={s.counter} key={c.label}>
                <dt className={s.label}>{c.label}</dt>
                <dd className={s.number}>
                  <span className="sr-only">{`${c.value}${c.suffix}`}</span>
                  <span aria-hidden="true" data-value={c.value} data-suffix={c.suffix}>
                    {`${c.value}${c.suffix}`}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
