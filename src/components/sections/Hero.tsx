"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { heroChips, person, type Chip } from "@/content/site";
import { gsap, SplitText, ease } from "@/lib/gsap";
import { useMotion, useSectionMotion } from "@/lib/motion";
import { cue } from "@/lib/sound";
import { Laptop } from "../Laptop";
import { SkillChip } from "../SkillChip";
import s from "./Hero.module.css";

// Screen centre while the lid is open and the camera is pushed in (frame 1b).
const SCREEN = { x: 720, y: 385 };
// Laptop camera keyframes: yPercent of its own height, scale.
const CAM = { closed: [21.154, 1.2], push: [15.385, 1.4], settled: [84.231, 0.72] } as const;

const layerOf = (c: Chip) => (c.depth === 0 ? "front" : c.depth < 0.5 ? "mid" : "back");
// SkillChip v2: blur = depth × 7px, opacity = 1 − depth × 0.6.
const chipOpacity = (depth: number) => 1 - depth * 0.6;
const chipBlur = (depth: number) => depth * 7;
const LAYERS = [
  { id: "back", period: 90, rx: 1.25, ry: 1.1 },
  { id: "mid", period: 70, rx: 1, ry: 0.9 },
  { id: "front", period: 50, rx: 0.7, ry: 0.65 },
] as const;

function chipStyle(c: Chip): CSSProperties {
  return {
    "--x": c.x,
    "--y": c.y,
    "--size": c.size,
    "--depth": c.depth,
    ...(c.m && { "--mx": c.m.x, "--my": c.m.y, "--msize": c.m.size, "--mdepth": c.m.depth }),
  } as CSSProperties;
}

function ChipLayer({ id }: { id: string }) {
  return (
    <div className={s.layer} data-layer={id} aria-hidden="true">
      {heroChips
        .filter((c) => layerOf(c) === id)
        .map((c) => (
          <div
            key={c.label}
            className={s.chip}
            data-chip
            data-mobile={c.m ? "" : undefined}
            style={chipStyle(c)}
          >
            <SkillChip label={c.label} />
          </div>
        ))}
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { mode, paused, setPaused } = useMotion();
  const orbit = useRef<{ tweens: gsap.core.Tween[]; visible: boolean; settled: boolean } | null>(null);
  const pausedRef = useRef(paused);

  const syncOrbit = () => {
    const o = orbit.current;
    if (!o) return;
    const play = o.visible && o.settled && !pausedRef.current;
    o.tweens.forEach((t) => (play ? t.play() : t.pause()));
  };
  useEffect(() => {
    pausedRef.current = paused;
    syncOrbit();
  }, [paused]);

  useSectionMotion(sectionRef, (m) => {
    const section = sectionRef.current!;
    const q = gsap.utils.selector(section);
    const laptop = q("[data-laptop]")[0];
    const wrap = q(`.${s.laptopWrap}`)[0];
    const chips = q("[data-chip]") as HTMLElement[];

    if (m === "reduced") return;

    if (m === "mobile") {
      gsap.fromTo(
        laptop,
        { "--open": 0, "--lines": 0, "--glow": 0.15 },
        {
          "--open": 1,
          "--lines": 6,
          "--glow": 0.7,
          ease: "none",
          // Scene is already on screen at load, so start early: the lid reads as
          // mostly open on arrival and finishes opening after a short scroll.
          scrollTrigger: { trigger: wrap, start: "top bottom", end: "center 30%", scrub: 0.8 },
        },
      );
      gsap.to(q("[data-chip][data-mobile]"), {
        opacity: (_i, el: HTMLElement) => chipOpacity(Number(getComputedStyle(el).getPropertyValue("--mdepth"))),
        duration: 0.6,
        stagger: 0.08,
        ease: ease.expo,
        scrollTrigger: { trigger: wrap, start: "top 80%" },
      });
      return;
    }

    // ---- full: pinned 300vh timeline (Developer Spec §1) ----
    const name = q(`.${s.name}`)[0];
    const split = SplitText.create(name, { type: "chars", aria: "auto" });

    gsap.set(laptop, { "--open": 0, "--lines": 0, "--glow": 0.15 });
    gsap.set(wrap, { y: 0, yPercent: CAM.closed[0], scale: CAM.closed[1] });
    gsap.set(name, { opacity: 1 });
    gsap.set(split.chars, { opacity: 0, yPercent: 60 });
    gsap.set(q(`.${s.sub}, .${s.intro}`), { opacity: 0, y: 24 });
    chips.forEach((el) => {
      const cs = getComputedStyle(el);
      const x = Number(cs.getPropertyValue("--x"));
      const y = Number(cs.getPropertyValue("--y"));
      gsap.set(el, { opacity: 0, "--fx": SCREEN.x - x, "--fy": SCREEN.y - y, "--fs": 0.2, "--b": 8 });
    });

    let lastP = 0;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: q(`.${s.pin}`)[0],
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 0.8,
        onUpdate: (st) => {
          if (st.direction > 0 && st.progress > 0.03 && lastP <= 0.03) cue("lid-open");
          lastP = st.progress;
          if (orbit.current) {
            orbit.current.settled = st.progress > 0.8;
            syncOrbit();
          }
        },
      },
    });

    tl.to(laptop, { "--open": 1, duration: 0.35, ease: ease.power3 }, 0)
      .to(laptop, { "--glow": 0.85, duration: 0.35 }, 0)
      .to(q(`.${s.bgFinal}`), { opacity: 1, duration: 0.35 }, 0)
      .to(q(`.${s.role}, .${s.hint}`), { opacity: 0, y: -20, duration: 0.15 }, 0)
      .to(laptop, { "--lines": 6, duration: 0.3, ease: "steps(6)" }, 0.2)
      .to(wrap, { yPercent: CAM.push[0], scale: CAM.push[1], duration: 0.25 }, 0.3)
      .to(
        chips,
        {
          opacity: (_i, el: HTMLElement) => chipOpacity(Number(getComputedStyle(el).getPropertyValue("--depth"))),
          "--fx": 0,
          "--fy": 0,
          "--fs": 1,
          "--b": (_i: number, el: HTMLElement) => chipBlur(Number(getComputedStyle(el).getPropertyValue("--depth"))),
          duration: 0.23,
          stagger: 0.12 / chips.length,
          ease: ease.expo,
        },
        0.45,
      )
      .to(wrap, { yPercent: CAM.settled[0], scale: CAM.settled[1], duration: 0.25, ease: ease.power3 }, 0.65)
      .to(split.chars, { opacity: 1, yPercent: 0, duration: 0.08, stagger: 0.14 / split.chars.length, ease: ease.expo }, 0.78)
      .to(q(`.${s.sub}, .${s.intro}`), { opacity: 1, y: 0, duration: 0.15, stagger: 0.03, ease: ease.expo }, 0.85)
      .fromTo(q(`.${s.progress} span`), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
      .to(q(`.${s.cursorLight}`), { opacity: 1, duration: 0.2 }, 0.8);

    // Idle orbit: each layer drifts on an ellipse; stops off-screen or when paused.
    const tweens = LAYERS.map(({ id, period, rx, ry }) => {
      const layer = q(`[data-layer="${id}"]`)[0];
      const setX = gsap.quickSetter(layer, "xPercent");
      const setY = gsap.quickSetter(layer, "yPercent");
      const proxy = { a: 0 };
      return gsap.to(proxy, {
        a: Math.PI * 2,
        duration: period,
        ease: "none",
        repeat: -1,
        paused: true,
        onUpdate: () => {
          setX(Math.cos(proxy.a) * rx - rx);
          setY(Math.sin(proxy.a) * ry);
        },
      });
    });
    orbit.current = { tweens, visible: true, settled: false };
    const io = new IntersectionObserver(([entry]) => {
      if (!orbit.current) return;
      orbit.current.visible = entry.isIntersecting;
      syncOrbit();
    });
    io.observe(section);

    // Cursor light trails the pointer (quickTo, 0.8s lag) on fine pointers only.
    const pin = q(`.${s.pin}`)[0] as HTMLElement;
    let onMove: ((e: PointerEvent) => void) | null = null;
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const light = q(`.${s.cursorLight}`)[0];
      const stage = q(`.${s.stage}`)[0];
      const xTo = gsap.quickTo(light, "x", { duration: 0.8, ease: "power3" });
      const yTo = gsap.quickTo(light, "y", { duration: 0.8, ease: "power3" });
      onMove = (e) => {
        const r = stage.getBoundingClientRect();
        const k = r.width / 1440; // light's resting centre is (1160, 320) on the stage
        xTo(e.clientX - (r.left + 1160 * k));
        yTo(e.clientY - (r.top + 320 * k));
      };
      pin.addEventListener("pointermove", onMove);
    }

    return () => {
      if (onMove) pin.removeEventListener("pointermove", onMove);
      io.disconnect();
      tweens.forEach((t) => t.kill());
      orbit.current = null;
    };
  });

  return (
    <section ref={sectionRef} className={`${s.hero} grain`} aria-labelledby="hero-name">
      <div className={s.pin}>
        <div className={s.bgStart} aria-hidden="true" />
        <div className={s.bgFinal} aria-hidden="true" />
        <div className={s.stage}>
          <div className={s.cursorLight} aria-hidden="true" />
          <div className={s.text}>
            <h1 id="hero-name" className={s.name}>
              {person.name}
            </h1>
            <p className={s.sub}>
              {person.headline} <span className="gradient-text">{person.headlineAccent}</span>
            </p>
            <p className={s.intro}>{person.intro}</p>
          </div>
          <p className={s.role} aria-hidden="true">
            {person.role}
          </p>
          <div className={s.scene}>
            <ChipLayer id="back" />
            <div className={s.laptopWrap}>
              <Laptop priority label="Laptop opening to show accessible button code, surrounded by technology icons" />
            </div>
            <ChipLayer id="mid" />
            <ChipLayer id="front" />
          </div>
          <div className={s.hint} aria-hidden="true">
            <span className={s.mouse}>
              <span />
            </span>
            Scroll to open
          </div>
          <div className={s.progress} aria-hidden="true">
            <span />
          </div>
        </div>
        {mode === "full" && (
          <button
            type="button"
            className={s.pause}
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            <span className={s.pauseIcon} data-paused={paused || undefined} aria-hidden="true" />
            Pause motion
          </button>
        )}
      </div>
    </section>
  );
}
