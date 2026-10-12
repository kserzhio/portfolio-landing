"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { fixes, transcripts } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSectionMotion } from "@/lib/motion";
import { cue } from "@/lib/sound";
import { FIX_EVENT } from "../features/Companion";
import s from "./BeforeAfter.module.css";

const TOTAL = fixes.length;

/** Red issue marker; once fixed it turns into a green check, flashes and shrinks away. */
function Marker({ n, on }: { n: number; on: boolean }) {
  return (
    <span className={s.marker} data-on={on || undefined}>
      <span className={s.markerNum}>{n}</span>
      <span className={s.markerCheck}>✓</span>
    </span>
  );
}

/** The demonstration form — a non-interactive picture (aria-hidden). */
function DemoForm({ fixed }: { fixed: number }) {
  const has = (n: number) => fixed >= n;
  const focus = fixed === 3 ? "email" : fixed >= 4 ? "eye" : undefined;
  return (
    <div
      className={s.form}
      aria-hidden="true"
      data-contrast={has(1) || undefined}
      data-labels={has(2) || undefined}
      data-focus={focus}
      data-names={has(4) || undefined}
      data-error={has(5) || undefined}
    >
      <div className={s.formHead}>
        <span className={s.formTitle}>Create account</span>
        <span className={s.close}>
          ✕
          <span className={s.tooltip}>Close</span>
          <Marker n={4} on={!has(4)} />
        </span>
      </div>

      <span className={s.helper}>
        Join to save your progress.
        <Marker n={1} on={!has(1)} />
      </span>

      <div className={s.group}>
        <span className={s.label}>
          Email address <span className={s.req}>*</span>
        </span>
        <span className={`${s.field} ${s.email}`}>
          <span className={s.placeholder}>Email</span>
          <span className={s.value}>alex@company.co</span>
          <span className={s.ring} />
          <Marker n={2} on={!has(2)} />
        </span>
      </div>

      <div className={s.group}>
        <span className={s.label}>
          Password <span className={s.req}>*</span>
        </span>
        <span className={`${s.field} ${s.password}`}>
          <span className={s.dots}>••••••</span>
          <span className={s.eye}>
            <span className={s.eyeIcon} />
            <span className={s.ring} />
          </span>
        </span>
      </div>

      <div className={s.errorRow}>
        <span className={s.errorBefore}>
          Too short
          <Marker n={5} on={!has(5)} />
        </span>
        <span className={s.errorAfter}>
          <span className={s.errorIcon}>!</span>
          Password must be at least 12 characters.
        </span>
      </div>

      <span className={s.submit}>
        Create account
        <Marker n={3} on={!has(3)} />
      </span>
      <span className={s.footer}>
        Already have an account? <span className={s.signin}>Sign in</span>
      </span>
    </div>
  );
}

function FixList({ fixed }: { fixed: number }) {
  return (
    <div className={s.listCol} aria-hidden="true">
      <span className={s.colLabel}>{fixed === 0 ? "Issues found" : "Fixes"}</span>
      <ol className={s.cards}>
        {fixes.map((f, i) => {
          const done = fixed > i;
          return (
            <li key={f.issue} className={s.card} data-done={done || undefined} data-current={fixed === i + 1 || undefined}>
              <div className={`${s.face} ${s.issueFace}`}>
                <span className={s.badgeRed}>{i + 1}</span>
                <span className={s.cardText}>
                  <b>{f.issue}</b>
                  <span>{f.issueDetail}</span>
                  <span className={s.wcag}>{f.wcag}</span>
                </span>
              </div>
              <div className={`${s.face} ${s.fixFace}`}>
                <span className={s.badgeGreen}>✓</span>
                <span className={s.cardText}>
                  <b>{f.fix}</b>
                  <span className={f.code ? s.mono : undefined}>{f.fixDetail}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Transcript({ fixed }: { fixed: number }) {
  const t = transcripts[fixed];
  return (
    <div className={s.sr} aria-hidden="true">
      <div className={s.srHead}>
        <b>Screen reader</b>
        <span className={s.srBadge}>SIMULATED · NVDA</span>
      </div>
      <ol className={s.srLines}>
        {t.lines.map((line, i) => {
          const named = line.includes(",");
          return (
            <li
              key={`${i}-${line}`}
              className={s.srLine}
              data-named={named || undefined}
              data-current={t.current === i || undefined}
            >
              {t.current === i ? "▸ " : ""}
              {line}
            </li>
          );
        })}
      </ol>
      <div className={s.srFoot}>
        <span>{t.stops} stops</span>
        <span data-all={t.meaningful === t.stops || undefined}>{t.meaningful} meaningful</span>
      </div>
    </div>
  );
}

/**
 * Closing beat after fix 5 (mockup 4e): drag a divider across Before / After.
 * Native range input styled as a knob. dir="rtl" so the value reads as
 * "% after" while Before stays on the left: Home = Before, End = After.
 */
function CompareSlider() {
  const [after, setAfter] = useState(50);
  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  // Arrows move 10% in the direction they point, regardless of dir="rtl".
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const delta = { ArrowLeft: 10, ArrowDown: 10, ArrowRight: -10, ArrowUp: -10 }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    setAfter((v) => clamp(v + delta));
  };

  return (
    <div className={s.compare}>
      <h3 className={s.compareTitle}>Drag to compare.</h3>
      <div className={s.compareBox} style={{ "--x": `${100 - after}%` } as CSSProperties}>
        <span className={s.tagBefore} aria-hidden="true">
          Before
        </span>
        <span className={s.tagAfter} aria-hidden="true">
          After
        </span>
        <div className={s.compareAfter}>
          <DemoForm fixed={TOTAL} />
        </div>
        <div className={s.compareBefore}>
          <DemoForm fixed={0} />
        </div>
        <input
          type="range"
          dir="rtl"
          min={0}
          max={100}
          step={1}
          value={after}
          className={s.range}
          aria-label="Compare the form before and after the fixes"
          aria-valuetext={`Showing ${after}% after`}
          onChange={(e) => setAfter(clamp(Number(e.target.value)))}
          onKeyDown={onKeyDown}
        />
        <span className={s.divider} aria-hidden="true" />
        <span className={s.knob} aria-hidden="true">
          ‹ ›
        </span>
      </div>
    </div>
  );
}

export function BeforeAfter() {
  const ref = useRef<HTMLElement>(null);
  // Server/no-JS render shows the finished "After" state.
  const [fixed, setFixed] = useState(TOTAL);
  const fixedRef = useRef(TOTAL);

  const update = (n: number) => {
    const v = Math.max(0, Math.min(TOTAL, n));
    if (v !== fixedRef.current) {
      if (v > fixedRef.current) cue("fix");
      fixedRef.current = v;
      setFixed(v);
      window.dispatchEvent(new CustomEvent(FIX_EVENT, { detail: v }));
    }
  };

  // "The page breaks, then heals" (spec 11.6): one-shot, time-based, once per
  // visit. Visual only — a backdrop-filter layer plus presentational classes.
  const healRef = useRef<HTMLDivElement>(null);
  const heal = () => {
    try {
      if (sessionStorage.getItem("healed")) return;
      sessionStorage.setItem("healed", "1");
    } catch {
      /* storage unavailable: may replay */
    }
    const section = ref.current!;
    const layer = healRef.current!;
    gsap
      .timeline({ onComplete: () => gsap.set(layer, { clearProps: "all" }) })
      .call(() => section.setAttribute("data-broken", ""))
      .set(layer, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" })
      .to({}, { duration: 0.5 + 0.3 }) // break, hold
      .to(layer, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut" })
      .fromTo(layer.firstElementChild, { yPercent: 0 }, { yPercent: 100 * (innerHeight / 3), duration: 0.8, ease: "power2.inOut" }, "<")
      .call(() => section.removeAttribute("data-broken"), [], "<0.35")
      .set(layer, { opacity: 0 });
  };

  useSectionMotion(ref, (mode) => {
    if (mode === "reduced") return update(TOTAL);
    ScrollTrigger.create({
      trigger: ref.current,
      start: mode === "full" ? "top top" : "top 40%",
      once: true,
      onEnter: heal,
    });
    if (mode === "mobile") return update(0);

    update(0);
    const q = gsap.utils.selector(ref.current);
    ScrollTrigger.create({
      trigger: q(`.${s.pin}`)[0],
      start: "top top",
      end: "+=350%",
      pin: true,
      snap: { snapTo: [0, 0.2, 0.4, 0.6, 0.8, 1], duration: 0.4, ease: "power2.inOut" },
      // Each fix completes as its step settles (0.2, 0.4 …).
      onUpdate: (st) => update(Math.floor(st.progress * TOTAL + 0.35)),
    });
  });

  const label =
    fixed === 0 ? "Fix 0 of 5" : fixed === TOTAL ? "5 of 5 fixed" : `Fix ${fixed} of 5 · ${fixes[fixed - 1].short}`;

  return (
    <section ref={ref} id="accessibility" className={s.section} data-theme="light" aria-labelledby="a11y-title">
      <div ref={healRef} className={s.heal} aria-hidden="true">
        <span className={s.healWave} />
      </div>
      <div className={s.pin}>
        <div className={s.head}>
          <div>
            <p className="eyebrow">Before / After</p>
            <h2 id="a11y-title" className={s.title} tabIndex={-1}>
              <span className="sr-only">Before and after: watch a form become usable</span>
              <span className={s.titleVis} aria-hidden="true">
                <span data-on={fixed < TOTAL || undefined}>Watch a form become usable.</span>
                <span data-on={fixed === TOTAL || undefined}>Same form. Everyone can use it.</span>
              </span>
            </h2>
          </div>
          <div className={s.progress} aria-hidden="true">
            <span className={s.progressLabel}>{label}</span>
            <span className={s.bars}>
              {fixes.map((f, i) => (
                <span key={f.short} data-done={fixed > i || undefined} />
              ))}
            </span>
          </div>
        </div>

        <div className={s.grid}>
          <figure className={s.figure}>
            <DemoForm fixed={fixed} />
            <figcaption className="sr-only">
              Demonstration of a &ldquo;Create account&rdquo; form with five accessibility issues, fixed one at a time. The
              issues, fixes and screen-reader output are listed in full below.
            </figcaption>
          </figure>
          <FixList fixed={fixed} />
          <Transcript fixed={fixed} />
        </div>

        <div className={s.stepper}>
          <button type="button" className={s.stepBtn} onClick={() => update(fixedRef.current - 1)} disabled={fixed === 0}>
            Previous fix
          </button>
          <button type="button" className={s.stepBtn} onClick={() => update(fixedRef.current + 1)} disabled={fixed === TOTAL}>
            Next fix
          </button>
          <button type="button" className={s.stepLink} onClick={() => update(TOTAL)} disabled={fixed === TOTAL}>
            Show final
          </button>
        </div>

        <div className="sr-only">
          <h3>Issues and fixes</h3>
          <ol>
            {fixes.map((f, i) => (
              <li key={f.issue}>
                Issue {i + 1}: {f.issue} ({f.issueDetail}, {f.wcag}). Fix: {f.fix} — {f.fixDetail.replace("\n", ", ")}.
              </li>
            ))}
          </ol>
          <h3>Screen reader output before the fixes</h3>
          <ol>
            {transcripts[0].lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
          <h3>Screen reader output after the fixes</h3>
          <ol>
            {transcripts[TOTAL].lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
        </div>
      </div>
      <CompareSlider />
    </section>
  );
}
