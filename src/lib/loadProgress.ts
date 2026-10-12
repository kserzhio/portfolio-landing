// What counts as loader progress (Developer Spec §10): fonts + the hero
// laptop model. Everything else loads after the reveal.
export type LoadTask = "fonts" | "laptop-module" | "laptop";

const WEIGHTS: Record<LoadTask, number> = { fonts: 0.3, "laptop-module": 0.45, laptop: 0.25 };

const done = new Set<LoadTask>();
const listeners = new Set<() => void>();

export function markLoaded(task: LoadTask) {
  if (done.has(task)) return;
  done.add(task);
  listeners.forEach((fn) => fn());
}

export function isLoaded(task: LoadTask) {
  return done.has(task);
}

/** 0–1, weighted by task. */
export function loadProgress() {
  let p = 0;
  done.forEach((t) => (p += WEIGHTS[t]));
  return Math.min(1, p);
}

export function onLoadProgress(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
