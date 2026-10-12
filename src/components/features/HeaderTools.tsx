"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useFeatures, VISION_MODES, type VisionMode } from "@/lib/features";
import { downloadA11yReport } from "./XRay";
import s from "./features.module.css";

const Icon = {
  hear: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  xray: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="6.5" y="8" width="5" height="3" rx="1" fill="currentColor" />
      <path d="M6.5 14h11M6.5 16.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  vision: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    </svg>
  ),
  sound: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M17 9l4 6M21 9l-4 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" data-off />
      <path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" data-on />
    </svg>
  ),
};

function VisionMenu({ inline }: { inline: boolean }) {
  const { vision, setVision, lens, setLens } = useFeatures();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || inline) return;
    const onDoc = (e: Event) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        wrapRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, inline]);

  const options = (
    <fieldset className={s.visionMenu} id={menuId}>
      <legend>Simulate vision</legend>
      {[{ id: "off" as VisionMode, label: "Off" }, ...VISION_MODES].map((m, i) => (
        <label key={m.id} className={s.radio}>
          <input type="radio" name={`vision-${menuId}`} checked={vision === m.id} onChange={() => setVision(m.id)} />
          {m.label}
          {i > 0 && <kbd aria-hidden="true">{i}</kbd>}
        </label>
      ))}
      <label className={s.radio}>
        <input type="checkbox" checked={lens} onChange={(e) => setLens(e.target.checked)} />
        Lens follows the cursor
      </label>
    </fieldset>
  );

  if (inline) return options;
  return (
    <div ref={wrapRef} className={s.toolWrap}>
      <button
        type="button"
        className={s.tool}
        aria-expanded={open}
        aria-controls={menuId}
        data-on={vision !== "off" || undefined}
        onClick={() => setOpen(!open)}
        aria-label="Vision simulator"
      >
        {Icon.vision}
        <span className={s.tip} aria-hidden="true">
          Vision simulator
        </span>
      </button>
      {open && <div className={s.popover}>{options}</div>}
    </div>
  );
}

/**
 * Header controls for the signature features (Developer Spec §11):
 * Hear this page, X-ray, vision simulator, sound. `inline` renders them as
 * a labelled list for the mobile menu.
 */
export function HeaderTools({ inline = false }: { inline?: boolean }) {
  const { reader, setReader, xray, setXray, sound, setSound } = useFeatures();
  const cls = inline ? s.toolRow : s.tool;
  // Icon buttons get an explicit aria-label; the visible tooltip is decorative.
  const label = (text: string) =>
    inline ? <span>{text}</span> : (
      <span className={s.tip} aria-hidden="true">
        {text}
      </span>
    );
  const name = (text: string) => (inline ? {} : { "aria-label": text });

  return (
    <div className={inline ? s.toolsInline : s.tools}>
      <button type="button" className={cls} aria-pressed={reader} onClick={() => setReader(!reader)} {...name("Hear this page")}>
        {Icon.hear}
        {label("Hear this page")}
      </button>
      <button type="button" role="switch" className={cls} aria-checked={xray} onClick={() => setXray(!xray)} {...name("X-ray")}>
        {Icon.xray}
        {label("X-ray")}
      </button>
      <VisionMenu inline={inline} />
      <button
        type="button"
        className={cls}
        aria-pressed={sound}
        data-sound={sound ? "on" : "off"}
        onClick={() => setSound(!sound)}
        {...name("Sound")}
      >
        {Icon.sound}
        {label("Sound")}
      </button>
      <button type="button" className={inline ? s.toolRow : `${s.reportLink} sr-only-focusable`} onClick={downloadA11yReport}>
        Download this site&rsquo;s accessibility report (JSON)
      </button>
    </div>
  );
}
