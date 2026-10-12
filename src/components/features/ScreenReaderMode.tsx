"use client";

import { useEffect, useRef, useState } from "react";
import { collect, describe, inViewport, type A11yNode } from "@/lib/a11yTree";
import { useFeatures } from "@/lib/features";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import s from "./features.module.css";

const MAX_STOPS = 12;

const roleLabel = (n: A11yNode) => (n.role === "heading" ? `heading, level ${n.level}` : n.role);

/**
 * Screen reader mode — "Hear this page" (Developer Spec §11.1, mockup 1d).
 * The page dims to 24%; a spotlight focus ring glides between the first 12
 * stops on screen (landmarks, headings, controls), each spoken via
 * speechSynthesis and captioned with the next stop. Real focus never moves;
 * Esc, any key or the Stop buttons end it.
 */
export function ScreenReaderMode() {
  const { reader, setReader } = useFeatures();
  const { mode } = useMotion();
  const ringRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [caption, setCaption] = useState({ text: "", next: "", stop: "" });

  useEffect(() => {
    if (!reader) return;
    const ring = ringRef.current!;
    const nextBox = nextRef.current!;
    const label = labelRef.current!;
    const reduced = mode === "reduced";
    const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
    const voice = synth?.getVoices().find((v) => v.lang.startsWith("en"));
    let current: HTMLElement | null = null;
    let upcoming: HTMLElement | null = null;
    let timer: number | undefined;
    let stopped = false;

    // The queue comes from the real DOM: what's on screen right now, in reading order.
    const queue: A11yNode[] = collect(document)
      .filter((n) => !n.el.closest("[data-feature-ui]") && inViewport(n.el))
      .slice(0, MAX_STOPS);

    const geo = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(el).borderRadius) || 8;
      return { x: r.left - 6, y: r.top - 6, width: r.width + 12, height: r.height + 12, borderRadius: Math.max(12, radius + 6) };
    };
    const place = (animate: boolean) => {
      if (current) {
        const g = geo(current);
        if (animate && !reduced) gsap.to(ring, { ...g, duration: 0.5, ease: "expo.out", overwrite: "auto" });
        else gsap.set(ring, g);
        gsap.set(label, { x: g.x, y: Math.max(4, g.y - 34) });
      }
      if (upcoming) gsap.set(nextBox, { ...geo(upcoming), opacity: 1 });
      else gsap.set(nextBox, { opacity: 0 });
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      synth?.cancel();
      window.clearTimeout(timer);
      setReader(false);
    };

    const speak = (i: number) => {
      if (stopped) return;
      if (i >= queue.length) return stop();
      const node = queue[i];
      current = node.el;
      upcoming = queue[i + 1]?.el ?? null;
      place(i > 0);
      const line = describe(node, true);
      setCaption({
        text: line,
        next: queue[i + 1] ? queue[i + 1].name || roleLabel(queue[i + 1]) : "End of page summary",
        stop: `STOP ${i + 1} / ${queue.length} · ${roleLabel(node)}`,
      });
      const next = () => (timer = window.setTimeout(() => speak(i + 1), 250));
      if (synth) {
        const u = new SpeechSynthesisUtterance(line);
        u.rate = 1.05;
        u.lang = "en-US";
        if (voice) u.voice = voice;
        u.onend = next;
        u.onerror = next;
        synth.speak(u);
      } else {
        timer = window.setTimeout(() => speak(i + 1), 1800); // captions only
      }
    };

    // Keep the ring on its element while the page scrolls under it.
    const follow = () => place(false);
    gsap.ticker.add(follow);
    // Don't fight assistive tech or the user: any key stops it.
    const onKey = () => stop();
    window.addEventListener("keydown", onKey, true);

    gsap.set(ring, { opacity: 1 });
    speak(0);

    return () => {
      stopped = true;
      synth?.cancel();
      window.clearTimeout(timer);
      gsap.ticker.remove(follow);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [reader, mode, setReader]);

  if (!reader) return null;
  return (
    <div className={s.readerLayer} data-feature-ui>
      <div ref={nextRef} className={s.readerNext} aria-hidden="true" />
      <div ref={ringRef} className={s.readerRing} aria-hidden="true" />
      <span ref={labelRef} className={s.readerStop} aria-hidden="true">
        {caption.stop}
      </span>

      <button type="button" className={s.readerOn} aria-pressed="true" onClick={() => setReader(false)}>
        <span className={s.readerDot} aria-hidden="true" />
        Hear this page · On
      </button>

      <div className={s.caption}>
        <span className={s.eq} data-static={mode === "reduced" || undefined} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className={s.captionBody} aria-hidden="true">
          <span className={s.captionText}>&ldquo;{caption.text}&rdquo;</span>
          <span className={s.captionNext}>Next: {caption.next}</span>
        </span>
        <button type="button" className={s.captionStop} onClick={() => setReader(false)}>
          Stop · Esc
        </button>
      </div>
    </div>
  );
}
