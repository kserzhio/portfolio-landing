// "The laptop is the site": the hero zooms into the laptop's screen, the page
// scrolls inside a screen frame, and Contact zooms back out and shuts the lid.
// Full-motion mode only.

/** Lid opening at which the screen faces the camera (no keystone), see laptop3d. */
export const OPEN_FACING = 0.918;

/**
 * The display's rectangle inside the 760×520 laptop box at OPEN_FACING, as
 * fractions of the box. Projected from laptop3d's camera and lid geometry
 * (camera 22° fov, 8° elevation, 0.8 m; display 288×180 mm) — update both together.
 */
const SCREEN = { x: 0.2163, y: 0.0873, w: 0.5674, h: 0.5181 };

/** Screen frame thickness in px; mirrors --bezel in globals.css. */
export const BEZEL = 14;

type Box = { left: number; top: number; width: number; height: number };

/**
 * GSAP transform that blows a laptop box up until its screen covers the frame
 * opening of a `vw`×`vh` viewport, centred. `box` is the untransformed layout
 * box in viewport coordinates; `origin` its transform-origin in px.
 */
export function coverScreen(box: Box, vw: number, vh: number, origin = { x: 0, y: 0 }) {
  const cx = box.width * (SCREEN.x + SCREEN.w / 2);
  const cy = box.height * (SCREEN.y + SCREEN.h / 2);
  // Cover, plus a hair so no sub-pixel seam shows at the frame's inner edge.
  const scale = Math.max((vw - 2 * BEZEL) / (box.width * SCREEN.w), (vh - 2 * BEZEL) / (box.height * SCREEN.h)) * 1.01;
  return {
    scale,
    x: vw / 2 - box.left - origin.x - scale * (cx - origin.x),
    y: vh / 2 - box.top - origin.y - scale * (cy - origin.y),
  };
}

/** Layout box of `el` relative to `frame` (both untransformed ancestors' offsets). */
export function boxIn(el: HTMLElement, frame: HTMLElement): Box {
  const parent = el.offsetParent as HTMLElement | null;
  const p = parent?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const f = frame.getBoundingClientRect();
  return {
    left: p.left - f.left + el.offsetLeft,
    top: p.top - f.top + el.offsetTop,
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
}
