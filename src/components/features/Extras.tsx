"use client";

import { useEffect, useRef, useState } from "react";
import { audit } from "@/content/audit";
import { focusOrder, inViewport, isHidden } from "@/lib/a11yTree";
import { useFeatures } from "@/lib/features";
import { CUE_EVENT, sounds, type Cue } from "@/lib/sound";
import s from "./features.module.css";

/** Sound design (§11.7, P3): plays cues only while the user has sound on. */
export function SoundCues() {
  const { sound } = useFeatures();
  useEffect(() => {
    if (!sound) return;
    let last = 0;
    const onFocus = () => {
      const now = performance.now();
      if (now - last > 60) sounds.tick();
      last = now;
    };
    const onCue = (e: Event) => {
      const c = (e as CustomEvent<Cue>).detail;
      if (c === "fix") sounds.unlock();
      else sounds.whoosh(c === "lid-open" ? "open" : "close");
    };
    document.addEventListener("focusin", onFocus);
    window.addEventListener(CUE_EVENT, onCue);
    return () => {
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener(CUE_EVENT, onCue);
    };
  }, [sound]);
  return null;
}

const TOAST_KEY = "tab-toast-shown";

/**
 * Keyboard easter egg (§11.11, P3): after 10 consecutive Tab presses with no
 * pointer use, a status toast invites keyboard users to get in touch. Shown
 * once per visit, never steals focus, auto-hides after 8s (paused on hover /
 * focus).
 */
export function TabToast() {
  const [open, setOpen] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(TOAST_KEY)) return;
    } catch {
      /* storage unavailable */
    }
    let count = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      count += 1;
      if (count >= 10) {
        setOpen(true);
        try {
          sessionStorage.setItem(TOAST_KEY, "1");
        } catch {
          /* storage unavailable */
        }
        cleanup();
      }
    };
    const reset = () => (count = 0);
    const cleanup = () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", reset);
      document.removeEventListener("pointermove", reset);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", reset);
    document.addEventListener("pointermove", reset);
    return cleanup;
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = toastRef.current!;
    let left = 8000;
    let last = performance.now();
    let held = false;
    const hold = (v: boolean) => () => (held = v);
    const on = hold(true);
    const off = hold(false);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    const id = window.setInterval(() => {
      const now = performance.now();
      if (!held) left -= now - last;
      last = now;
      if (left <= 0) setOpen(false);
    }, 250);
    return () => window.clearInterval(id);
  }, [open]);

  return (
    <div role="status" className={s.toastRegion}>
      {open && (
        <div ref={toastRef} className={s.toast}>
          <span>You navigate like a real tester.</span>
          <a href="#contact" className={s.toastLink} onClick={() => setOpen(false)}>
            Let&rsquo;s talk <span aria-hidden="true">→</span>
          </a>
          <button type="button" className={s.toastClose} onClick={() => setOpen(false)} aria-label="Dismiss">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Visit summary (§11.12, P3): counts the focus stops this visit has passed
 * (focused or scrolled into view) and focus that landed on something hidden.
 * Audit numbers come from CI (src/content/audit.ts) — never hard-coded.
 */
export function VisitSummary() {
  const [stats, setStats] = useState({ passed: 0, lost: 0 });

  useEffect(() => {
    const seen = new Set<Element>();
    let lost = 0;
    const sync = () => setStats({ passed: seen.size, lost });
    const io = new IntersectionObserver((entries) => {
      let changed = false;
      entries.forEach((e) => {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          changed = true;
        }
      });
      if (changed) sync();
    });
    const observeAll = () => focusOrder().forEach((el) => io.observe(el));
    observeAll();
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (el === document.body || el.closest("[data-feature-ui]")) return;
      seen.add(el);
      // "Lost" = focus landed on something the user can't see.
      requestAnimationFrame(() => {
        const cs = getComputedStyle(el);
        if (isHidden(el) || Number(cs.opacity) === 0 || !inViewport(el)) lost += 1;
        sync();
      });
    };
    document.addEventListener("focusin", onFocus);
    const refresh = window.setInterval(observeAll, 3000);
    return () => {
      io.disconnect();
      document.removeEventListener("focusin", onFocus);
      window.clearInterval(refresh);
    };
  }, []);

  return (
    <p className={s.summary}>
      <span className={s.summaryDot} aria-hidden="true" />
      <span className={s.summaryMain}>
        You passed {stats.passed} focus stops. {stats.lost} got lost.
      </span>
      {audit && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            WCAG 2.2 AA · axe {audit.axeIssues} issues · Lighthouse {audit.lighthouseA11y}
          </span>
        </>
      )}
    </p>
  );
}
