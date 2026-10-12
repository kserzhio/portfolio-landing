import { gsap } from "./gsap";

const RANGE = 80; // px around the element
const MAX = 10; // px max translation

/**
 * Magnetic buttons (Developer Spec §11.9, P1): elements marked
 * [data-magnetic] inside `container` pull toward the pointer within 80px
 * (max 10px); their [data-magnetic-label] moves 1.5× for depth. Elastic
 * return on leave. The hit area never moves away from the pointer. Call only
 * for fine pointers outside reduced motion; returns a cleanup.
 */
export function magnetic(container: HTMLElement) {
  const items = [...container.querySelectorAll<HTMLElement>("[data-magnetic]")].map((el) => {
    const label = el.querySelector<HTMLElement>("[data-magnetic-label]");
    return {
      el,
      x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }),
      lx: label ? gsap.quickTo(label, "x", { duration: 0.4, ease: "power3" }) : null,
      ly: label ? gsap.quickTo(label, "y", { duration: 0.4, ease: "power3" }) : null,
      label,
      active: false,
      back: null as gsap.core.Tween | null,
    };
  });

  // Elastic return as its own tween. No `overwrite` — that would also kill the
  // quickTo tweens and the button would only be magnetic once.
  const release = (it: (typeof items)[number]) => {
    it.active = false;
    it.back?.kill();
    it.back = gsap.to([it.el, it.label].filter(Boolean), { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
  };

  const onMove = (e: PointerEvent) => {
    // Neighbouring buttons' 80px zones overlap, so only the nearest one pulls.
    type Hit = { it: (typeof items)[number]; d: number; cx: number; cy: number };
    let nearest = null as Hit | null;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      // Measure from the un-translated box so the pull can't feed back into itself.
      const tx = Number(gsap.getProperty(it.el, "x"));
      const ty = Number(gsap.getProperty(it.el, "y"));
      const left = r.left - tx;
      const top = r.top - ty;
      // Distance from the pointer to the box (0 when over it).
      const ex = Math.max(left - e.clientX, 0, e.clientX - (left + r.width));
      const ey = Math.max(top - e.clientY, 0, e.clientY - (top + r.height));
      const d = Math.hypot(ex, ey);
      if (d <= RANGE && (!nearest || d < nearest.d)) {
        nearest = { it, d, cx: left + r.width / 2, cy: top + r.height / 2 };
      }
    }

    items.forEach((it) => {
      if (it !== nearest?.it && it.active) release(it);
    });
    if (!nearest) return;
    const { it, cx, cy } = nearest;
    it.active = true;
    // Coming back while the elastic return still runs: stop it, or it would
    // override the pull and the button would stay put.
    if (it.back) {
      it.back.kill();
      it.back = null;
    }
    const dx = gsap.utils.clamp(-MAX, MAX, (e.clientX - cx) * 0.2);
    const dy = gsap.utils.clamp(-MAX, MAX, (e.clientY - cy) * 0.2);
    it.x(dx);
    it.y(dy);
    it.lx?.(dx * 0.5);
    it.ly?.(dy * 0.5);
  };
  const onLeave = () => items.forEach((it) => it.active && release(it));

  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", onLeave);
  return () => {
    container.removeEventListener("pointermove", onMove);
    container.removeEventListener("pointerleave", onLeave);
    items.forEach((it) => it.back?.kill());
    gsap.set(items.flatMap((it) => [it.el, it.label].filter(Boolean)), { x: 0, y: 0 });
  };
}
