"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { gsap, ScrollTrigger } from "./gsap";

export type MotionMode = "full" | "mobile" | "reduced";

const Q_FULL = "(min-width: 1024px)";
const Q_OS_REDUCED = "(prefers-reduced-motion: reduce)";
const STORAGE_KEY = "motion";

type Pref = "reduced" | "full" | null;

/** Explicit user choice from the header switch; null = follow the OS. */
function readPref(): Pref {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "reduced" || v === "full" ? v : null;
  } catch {
    return null;
  }
}

function isReduced(pref: Pref) {
  return pref ? pref === "reduced" : matchMedia(Q_OS_REDUCED).matches;
}

function computeMode(pref: Pref): MotionMode {
  if (isReduced(pref)) return "reduced";
  return matchMedia(Q_FULL).matches ? "full" : "mobile";
}

/**
 * Runs before first paint (inlined in <head>) so CSS can show the right
 * initial frame per mode. Without JS no data-motion is set and the page
 * renders its static, final states.
 */
export const motionBootScript = `(function(){try{var d=document.documentElement,p=null;try{p=localStorage.getItem('${STORAGE_KEY}')}catch(e){}var r=p==='reduced'||(p!=='full'&&matchMedia('${Q_OS_REDUCED}').matches);d.dataset.motion=r?'reduced':(matchMedia('${Q_FULL}').matches?'full':'mobile');d.classList.add('js');try{if(!sessionStorage.getItem('loader-seen'))d.classList.add('loading')}catch(e){}}catch(e){}})();`;

type ScrollToOptions = { offset?: number; duration?: number; onComplete?: () => void };

type MotionContextValue = {
  /** null until mounted on the client. */
  mode: MotionMode | null;
  /** Effective reduced-motion state shown by the header switch. */
  reduced: boolean;
  setReduced: (value: boolean) => void;
  /** Global pause for auto-playing loops (WCAG 2.2.2). */
  paused: boolean;
  setPaused: (value: boolean) => void;
  scrollTo: (target: HTMLElement | number, options?: ScrollToOptions) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<MotionMode | null>(null);
  const [reduced, setReducedState] = useState(false);
  const [paused, setPaused] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Track OS setting and viewport width.
  useEffect(() => {
    const sync = () => {
      const pref = readPref();
      setReducedState(isReduced(pref));
      setMode(computeMode(pref));
    };
    sync();

    const queries = [matchMedia(Q_FULL), matchMedia(Q_OS_REDUCED)];
    const onChange = sync;
    queries.forEach((q) => q.addEventListener("change", onChange));
    return () => queries.forEach((q) => q.removeEventListener("change", onChange));
  }, []);

  const setReduced = useCallback((value: boolean) => {
    const pref: Pref = value ? "reduced" : "full";
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* storage unavailable: choice lasts for this page view */
    }
    setReducedState(value);
    setMode(computeMode(pref));
  }, []);

  // Children (sections) build their timelines in layout effects before this
  // parent effect runs, so refresh here sees every trigger for the new mode.
  useLayoutEffect(() => {
    if (!mode) return;
    document.documentElement.dataset.motion = mode;

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    if (mode === "full") {
      lenis = new Lenis({ lerp: 0.1, autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    lenisRef.current = lenis;
    // Hold smooth scroll while the loader (Developer Spec §10) is up.
    const html = document.documentElement;
    const onLoaderDone = () => {
      lenis?.start();
      ScrollTrigger.refresh();
    };
    if (html.classList.contains("loading")) {
      lenis?.stop();
      window.addEventListener("loader:done", onLoaderDone, { once: true });
    }

    ScrollTrigger.refresh();
    const fontsReady = document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // Deep links land on the right section once pins are resolved.
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        Promise.resolve(fontsReady).then(() => {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo(0, top);
        });
      }
    }

    return () => {
      window.removeEventListener("loader:done", onLoaderDone);
      if (tick) gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [mode]);

  const scrollTo = useCallback((target: HTMLElement | number, options: ScrollToOptions = {}) => {
    const { offset = 0, duration = 1.2, onComplete } = options;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration, onComplete: () => onComplete?.() });
      return;
    }
    const top =
      typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + offset, behavior: "auto" });
    onComplete?.();
  }, []);

  const value = useMemo(
    () => ({ mode, reduced, setReduced, paused, setPaused, scrollTo }),
    [mode, reduced, setReduced, paused, scrollTo],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used inside <MotionProvider>");
  return ctx;
}

/**
 * Builds a section's animation for the current mode inside a gsap.context
 * scoped to `scope`, and reverts it cleanly when the mode changes.
 */
export function useSectionMotion(
  scope: RefObject<HTMLElement | null>,
  setup: (mode: MotionMode) => void | (() => void),
) {
  const { mode } = useMotion();
  const setupRef = useRef(setup);
  useLayoutEffect(() => {
    setupRef.current = setup;
  });

  useLayoutEffect(() => {
    const el = scope.current;
    if (!mode || !el) return;
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = setupRef.current(mode);
    }, el);
    return () => {
      cleanup?.();
      ctx.revert();
    };
  }, [mode, scope]);
}

/**
 * Pinned content must never hide focus: when focus enters `section`,
 * scroll to the trigger position returned by `position` (0–1).
 */
export function scrollOnFocus(
  section: HTMLElement,
  st: ScrollTrigger,
  position: (target: HTMLElement) => number | null,
  scrollTo: MotionContextValue["scrollTo"],
) {
  const onFocusIn = (event: FocusEvent) => {
    const p = position(event.target as HTMLElement);
    if (p == null) return;
    const y = st.start + p * (st.end - st.start) + 1;
    scrollTo(y, { duration: 0.6 });
  };
  section.addEventListener("focusin", onFocusIn);
  return () => section.removeEventListener("focusin", onFocusIn);
}
