"use client";

import { useState } from "react";
import { marqueeItems } from "@/content/team";
import s from "./team.module.css";

/**
 * Dark/yellow band of standards. The list is real text; the duplicate copy
 * that makes the loop seamless is hidden from assistive tech. It moves for
 * more than 5 s, so it gets a Pause button (WCAG 2.2.2); reduced motion keeps
 * it still.
 */
export function StandardsBand() {
  const [paused, setPaused] = useState(false);
  const items = (hidden: boolean) => (
    <ul className={s.bandRun} aria-hidden={hidden || undefined}>
      {marqueeItems.map((t) => (
        <li key={t}>
          {t}
          <span className={s.bandStar} aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className={s.band} aria-label="Standards we audit against" data-paused={paused || undefined}>
      <div className={s.bandTrack}>
        {items(false)}
        {items(true)}
      </div>
      <button
        type="button"
        className={s.bandPause}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        <span className={s.bandPauseIcon} aria-hidden="true" />
        <span className="sr-only">Pause scrolling standards</span>
      </button>
    </section>
  );
}
