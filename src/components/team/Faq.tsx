"use client";

import { useId, useState } from "react";
import { faq } from "@/content/team";
import s from "./team.module.css";

/** FAQ accordion: one heading + disclosure button per question; any can be open. */
export function Faq() {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const base = useId();

  const toggle = (i: number) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className={s.faqList}>
      {faq.map(({ q, a }, i) => {
        const isOpen = open.has(i);
        return (
          <div key={q} className={s.faqItem} data-open={isOpen || undefined}>
            <h3 className={s.faqQ}>
              <button
                type="button"
                id={`${base}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-a${i}`}
                onClick={() => toggle(i)}
              >
                <span>{q}</span>
                <span className={s.faqIcon} aria-hidden="true" />
              </button>
            </h3>
            <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`} className={s.faqA} hidden={!isOpen}>
              <p>{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
