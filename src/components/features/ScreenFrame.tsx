import s from "./ScreenFrame.module.css";

/**
 * The laptop's screen edge, drawn around the viewport while the page scrolls
 * "inside" the laptop (lib/screen.ts). Its opacity is --frame on <html>, which
 * the hero scrubs to 1 as the camera enters the screen and Contact scrubs back
 * to 0 as it pulls out. Full-motion mode only; purely decorative.
 */
export function ScreenFrame() {
  return <div className={s.frame} aria-hidden="true" />;
}
