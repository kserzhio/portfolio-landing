"use client";

import { useRef, useState } from "react";
import { chapters } from "@/content/site";
import { gsap, ScrollTrigger, ease } from "@/lib/gsap";
import { useMotion, useSectionMotion } from "@/lib/motion";
import { BrowserVisual, ChapterVisual, DashboardVisual, PhoneVisual, XrayVisual } from "./JourneyVisuals";
import s from "./Journey.module.css";

// Stage shapes as clip-path insets of the 620×540 stage (Developer Spec §3).
const SHAPES = [
  "inset(12.96% 4.84% 12.96% 4.84% round 2.58cqw)", // browser 560×400 r16
  "inset(0% 28.87% 0% 28.87% round 7.42cqw)", // phone 262×540 r46
  "inset(11.11% 0% 11.11% 0% round 2.58cqw)", // dashboard 620×420 r16
  "inset(11.11% 0% 11.11% 0% round 2.58cqw)", // same rect, x-ray
];
const CH = 0.25; // chapter length in timeline progress
const HOLD = 0.175; // morph + slide happen in the last 30% of each chapter

export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useMotion();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const stRef = useRef<ScrollTrigger | null>(null);

  useSectionMotion(ref, (mode) => {
    const q = gsap.utils.selector(ref.current);
    stRef.current = null;

    if (mode === "reduced") return;

    if (mode === "mobile") {
      gsap.fromTo(
        q(`.${s.vfill}`),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: q(`.${s.track}`)[0], start: "top center", end: "bottom center", scrub: true },
        },
      );
      (q(`.${s.articleVisual}`) as HTMLElement[]).forEach((el) =>
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: ease.expo,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }),
      );
      return;
    }

    // ---- full: pinned horizontal track ----
    const stage = q(`.${s.stage}`)[0];
    const sq = gsap.utils.selector(stage);
    const layers = sq(`.${s.layer}`);
    const track = q(`.${s.track}`)[0];

    // Chapter start states.
    gsap.set(sq('[data-visual="browser"] [data-block]'), { y: 30, opacity: 0 });
    gsap.set(sq("[data-cart]"), { y: -200, opacity: 0 });
    gsap.set(sq("[data-badge]"), { scale: 0 });
    gsap.set(sq("[data-type]"), { clipPath: "inset(0% 100% 0% 0%)" });
    gsap.set(sq('[data-visual="phone"] [data-ring]'), { opacity: 0 });
    gsap.set(sq("[data-sheet]"), { yPercent: 130 });
    gsap.set(sq("[data-kpi]"), { opacity: 0, y: 10 });
    gsap.set(sq("[data-bar]"), { scaleY: 0 });
    gsap.set(sq("[data-line]"), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(sq('[data-visual="xray"] [data-dim]'), { opacity: 1 });
    gsap.set(sq("[data-scan]"), { xPercent: -470, opacity: 0 });
    gsap.set(sq("[data-pop]"), { opacity: 0, scale: 0.9 });
    gsap.set(sq("[data-numeral]"), { opacity: 0, scale: 0 });
    gsap.set(sq("[data-alt]"), { opacity: 0, y: 6 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: q(`.${s.pin}`)[0],
        start: "top top",
        end: () => "+=" + track.scrollWidth,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (st) => {
          const idx = Math.min(chapters.length - 1, Math.floor(st.progress / CH));
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        },
      },
    });
    stRef.current = tl.scrollTrigger ?? null;

    // Rail: segment k fills across chapter k, reaching the next dot as it activates.
    q(`.${s.segFill}`).forEach((seg, k) => tl.fromTo(seg, { scaleX: 0 }, { scaleX: 1, duration: CH }, k * CH));

    // Morph + slide into chapter k+1.
    for (let k = 0; k < chapters.length - 1; k++) {
      const t = k * CH + HOLD;
      const d = CH - HOLD;
      tl.to(track, { xPercent: -(100 / chapters.length) * (k + 1), duration: d, ease: ease.power3 }, t)
        .fromTo(sq(`.${s.shape}`), { clipPath: SHAPES[k] }, { clipPath: SHAPES[k + 1], duration: d, ease: ease.power3 }, t)
        .to(layers[k], { opacity: 0, duration: d / 2 }, t)
        .fromTo(layers[k + 1], { opacity: 0 }, { opacity: 1, duration: d / 2 }, t + d / 2);
    }

    // 01 · wireframe assembles, cart drops in.
    tl.to(sq('[data-visual="browser"] [data-block]'), { y: 0, opacity: 1, duration: 0.05, stagger: 0.012, ease: ease.expo }, 0)
      .to(sq("[data-cart]"), { y: 0, opacity: 1, duration: 0.06, ease: "power3.in" }, 0.06)
      .fromTo(sq("[data-cart] span:first-child"), { opacity: 1 }, { opacity: 0, duration: 0.03 }, 0.12)
      .to(sq("[data-badge]"), { scale: 1, duration: 0.025, ease: "back.out(2)" }, 0.13);

    // 02 · form fills; focus ring moves Name → Email → Quantity → Button.
    const [nameT, emailT, qtyT] = sq("[data-type]") as HTMLElement[];
    const [nameR, emailR, qtyR, sendR] = sq('[data-visual="phone"] [data-ring]');
    const c2 = CH;
    tl.set(nameR, { opacity: 1 }, c2 + 0.005)
      .to(nameT, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.04, ease: `steps(${nameT.textContent!.length})` }, c2 + 0.01)
      .set(nameR, { opacity: 0 }, c2 + 0.055)
      .set(emailR, { opacity: 1 }, c2 + 0.055)
      .to(emailT, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.05, ease: `steps(${emailT.textContent!.length})` }, c2 + 0.06)
      .set(emailR, { opacity: 0 }, c2 + 0.115)
      .set(qtyR, { opacity: 1 }, c2 + 0.115)
      .to(qtyT, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.01, ease: "steps(1)" }, c2 + 0.12)
      .set(qtyR, { opacity: 0 }, c2 + 0.14)
      .set(sendR, { opacity: 1 }, c2 + 0.14)
      .to(sq("[data-sheet]"), { yPercent: 0, duration: 0.03, ease: ease.expo }, c2 + 0.145);

    // 03 · KPIs, bars grow left → right, line draws.
    const c3 = CH * 2;
    tl.to(sq("[data-kpi]"), { opacity: 1, y: 0, duration: 0.03, stagger: 0.008, ease: ease.expo }, c3)
      .to(sq("[data-bar]"), { scaleY: 1, duration: 0.05, stagger: 0.012, ease: ease.expo }, c3 + 0.02)
      .to(sq("[data-line]"), { strokeDashoffset: 0, duration: 0.13 }, c3 + 0.03);

    // 04 · scan band; accessibility tree surfaces behind it.
    const c4 = CH * 3;
    tl.to(sq("[data-scan]"), { xPercent: 330, duration: 0.18 }, c4 + 0.01)
      .to(sq("[data-scan]"), { opacity: 1, duration: 0.02 }, c4 + 0.01)
      .to(sq("[data-scan]"), { opacity: 0, duration: 0.02 }, c4 + 0.17)
      .to(sq('[data-visual="xray"] [data-dim]'), { opacity: 0.45, duration: 0.09 }, c4 + 0.01)
      .to(sq("[data-pop]"), { opacity: 1, scale: 1, duration: 0.03, stagger: 0.016, ease: ease.expo }, c4 + 0.03)
      .to(sq("[data-numeral]"), { opacity: 1, scale: 1, duration: 0.025, stagger: 0.022, ease: "back.out(2)" }, c4 + 0.05)
      .to(sq("[data-alt]"), { opacity: 1, y: 0, duration: 0.03, ease: ease.expo }, c4 + 0.2);
  });

  const goTo = (index: number) => {
    const st = stRef.current;
    if (st) {
      scrollTo(st.start + index * CH * (st.end - st.start) + 1);
      return;
    }
    const article = document.getElementById(chapters[index].id);
    if (article) scrollTo(article, { offset: -80 });
  };

  return (
    <section ref={ref} id="journey" className={`${s.journey} grain`} aria-labelledby="journey-title">
      <div className={s.pin}>
        <h2 id="journey-title" className={`eyebrow ${s.title}`} tabIndex={-1}>
          Career journey
          <span className={s.chapterOf} aria-hidden="true">
            {` · Chapter 0${active + 1} / 0${chapters.length}`}
          </span>
        </h2>

        <div className={s.stage} aria-hidden="true">
          <div className={s.shape} />
          <div className={`${s.layer} ${s.lBrowser}`}>
            <BrowserVisual />
          </div>
          <div className={`${s.layer} ${s.lPhone}`}>
            <PhoneVisual />
          </div>
          <div className={`${s.layer} ${s.lDash}`}>
            <DashboardVisual />
          </div>
          <div className={`${s.layer} ${s.lDash}`}>
            <XrayVisual />
          </div>
        </div>

        <div className={s.chapters}>
          <span className={s.vrail} aria-hidden="true">
            <span className={s.vfill} />
          </span>
          <div className={s.track}>
            {chapters.map((c, i) => (
              <article key={c.id} id={c.id} className={s.article} aria-labelledby={`${c.id}-title`}>
                {chapters[i + 1] && (
                  <span className={s.numeral} aria-hidden="true">
                    {chapters[i + 1].index.slice(0, 2)}
                  </span>
                )}
                <div className={s.text}>
                  <p className={s.index}>
                    <span className={s.indexNum}>{c.index}</span>
                    <span className={s.year}> · {c.year}</span>
                  </p>
                  <div className={s.articleVisual} data-kind={c.visual} aria-hidden="true">
                    <ChapterVisual kind={c.visual} />
                  </div>
                  <h3 id={`${c.id}-title`} className={s.chapterTitle}>
                    {c.title}
                    {c.titleAccent && <span className="gradient-text">{c.titleAccent}</span>}
                  </h3>
                  <p className={s.body}>{c.text}</p>
                  <ul className="pills" aria-label="Technologies">
                    {c.tags.map((t) => (
                      <li key={t} className="pill">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="sr-only">{`Chapter ${i + 1} of ${chapters.length}`}</span>
              </article>
            ))}
          </div>
        </div>

        <nav className={s.rail} aria-label="Career chapters">
          <ol className={s.steps}>
            {chapters.map((c, i) => (
              <li key={c.id} className={s.stepItem}>
                {/* Segment from this dot to the next — stops short of each dot. */}
                <span className={s.seg} aria-hidden="true">
                  <span className={s.segFill} />
                </span>
                <button
                  type="button"
                  className={s.step}
                  aria-current={active === i ? "step" : undefined}
                  data-done={i <= active || undefined}
                  onClick={() => goTo(i)}
                >
                  <span className={s.stepDot} aria-hidden="true" />
                  {c.year} · {c.rail}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
