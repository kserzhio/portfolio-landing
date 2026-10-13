"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFeatures, VISION_MODES, type VisionMode } from "@/lib/features";
import { useMotion } from "@/lib/motion";
import { downloadA11yReport } from "./XRay";
import s from "./features.module.css";

const Icon = {
  motion: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 12h3l2-5 4 10 2-5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
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
      <path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/** One row: icon, label + hint, and a switch-style state indicator. */
function ToggleRow({
  icon,
  label,
  hint,
  on,
  kind,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  on: boolean;
  kind: "switch" | "pressed";
  onToggle: () => void;
}) {
  const state = kind === "switch" ? { role: "switch", "aria-checked": on } : { "aria-pressed": on };
  return (
    <button type="button" className={s.row} {...state} onClick={onToggle}>
      <span className={s.rowIcon}>{icon}</span>
      <span className={s.rowText}>
        <span className={s.rowLabel}>{label}</span>
        <span className={s.rowHint}>{hint}</span>
      </span>
      <span className={s.rowTrack} aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

function ToolsList({ onAction }: { onAction?: () => void }) {
  const { reduced, setReduced } = useMotion();
  const { reader, setReader, xray, setXray, sound, setSound, vision, setVision, lens, setLens } = useFeatures();
  const groupId = useId();

  return (
    <div className={s.toolsList}>
      <ToggleRow
        icon={Icon.motion}
        label="Reduce motion"
        hint="Static scenes, short fades only"
        on={reduced}
        kind="switch"
        onToggle={() => setReduced(!reduced)}
      />
      <ToggleRow
        icon={Icon.hear}
        label="Hear this page"
        hint="Spoken tour of what's on screen"
        on={reader}
        kind="pressed"
        onToggle={() => {
          // Close the menu first so the spotlight tours the page, not the menu.
          onAction?.();
          requestAnimationFrame(() => setReader(!reader));
        }}
      />
      <ToggleRow
        icon={Icon.xray}
        label="X-ray"
        hint="Show landmarks, headings, focus order"
        on={xray}
        kind="switch"
        onToggle={() => setXray(!xray)}
      />
      <ToggleRow
        icon={Icon.sound}
        label="Sound"
        hint="Soft cues for focus and fixes"
        on={sound}
        kind="pressed"
        onToggle={() => setSound(!sound)}
      />

      <fieldset className={s.visionGroup}>
        <legend className={s.visionLegend}>
          <span className={s.rowIcon}>{Icon.vision}</span>
          Simulate vision
        </legend>
        <div className={s.visionOptions}>
          {[{ id: "off" as VisionMode, label: "Off" }, ...VISION_MODES].map((m, i) => (
            <label key={m.id} className={s.chip}>
              <input type="radio" name={`vision-${groupId}`} checked={vision === m.id} onChange={() => setVision(m.id)} />
              <span>
                {i > 0 && <kbd aria-hidden="true">{i}</kbd>}
                {m.label}
              </span>
            </label>
          ))}
        </div>
        <label className={s.check}>
          <input type="checkbox" checked={lens} onChange={(e) => setLens(e.target.checked)} />
          Lens follows the cursor
        </label>
      </fieldset>

      <button type="button" className={s.row} onClick={downloadA11yReport}>
        <span className={s.rowIcon}>{Icon.report}</span>
        <span className={s.rowText}>
          <span className={s.rowLabel}>Accessibility report</span>
          <span className={s.rowHint}>Download this page&rsquo;s structure (JSON)</span>
        </span>
      </button>
    </div>
  );
}

/**
 * "Accessibility tools" — one header menu for the motion preference and the
 * signature features (Developer Spec §11). Desktop: a disclosure button with a
 * popover (Esc / outside click close it, focus returns to the button).
 * `inline` renders the same list inside the mobile menu dialog.
 */
export function HeaderTools({ inline = false, onAction }: { inline?: boolean; onAction?: () => void }) {
  const { reader, xray, vision, sound } = useFeatures();
  const { reduced } = useMotion();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeCount = [reduced, reader, xray, vision !== "off", sound].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: Event) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (inline) {
    return (
      <section className={s.toolsInline} aria-labelledby={`${menuId}-title`}>
        <h2 id={`${menuId}-title`} className={s.toolsTitle}>
          Accessibility tools
        </h2>
        <ToolsList onAction={onAction} />
      </section>
    );
  }

  return (
    <div ref={wrapRef} className={s.toolsWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={s.toolsButton}
        aria-expanded={open}
        aria-controls={menuId}
        // Label stays when the visible text collapses at narrow widths.
        aria-label={`Accessibility tools${activeCount ? `, ${activeCount} on` : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className={s.aa} aria-hidden="true">
          Aa
        </span>
        <span className={s.toolsLabel} aria-hidden="true">
          Accessibility tools
        </span>
        {activeCount > 0 && (
          <span className={s.toolsBadge} aria-hidden="true">
            {activeCount}
          </span>
        )}
      </button>
      <div id={menuId} className={s.toolsMenu} hidden={!open} role="group" aria-label="Accessibility tools">
        <ToolsList onAction={() => setOpen(false)} />
      </div>
    </div>
  );
}
