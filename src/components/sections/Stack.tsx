"use client";

import { useEffect, useRef, useState } from "react";
import { heroChips, stack } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Logo, hasLogo } from "@/lib/logos";
import { useMotion, useSectionMotion } from "@/lib/motion";
import s from "./Stack.module.css";

// Monogram → hero chip label, so tiles can fly in from their hero orbit slot.
const HERO_ALIAS: Record<string, string> = { Re: "React", Nx: "Nuxt" };
const heroSlot = (mono: string) => heroChips.find((c) => c.label === (HERO_ALIAS[mono] ?? mono));

type Item = (typeof stack)[number]["items"][number];

function Tile({
  item,
  id,
  open,
  inline,
  onOpen,
  onClose,
}: {
  item: Item;
  id: string;
  open: boolean;
  inline: boolean;
  onOpen: (delay?: number) => void;
  onClose: () => void;
}) {
  const liRef = useRef<HTMLLIElement>(null);
  const [below, setBelow] = useState(false);
  const noteId = `${id}-note`;

  // Flip the tooltip below the tile when there's no room above.
  useEffect(() => {
    if (!open || inline || !liRef.current) return;
    setBelow(liRef.current.getBoundingClientRect().top < 220);
  }, [open, inline]);

  return (
    <li
      ref={liRef}
      className={s.item}
      onPointerEnter={(e) => !inline && e.pointerType === "mouse" && onOpen(100)}
      onPointerLeave={(e) => !inline && e.pointerType === "mouse" && onClose()}
    >
      <button
        type="button"
        className={s.tile}
        aria-describedby={inline ? undefined : noteId}
        aria-expanded={inline ? open : undefined}
        aria-controls={inline ? noteId : undefined}
        onFocus={() => !inline && onOpen()}
        onBlur={() => !inline && onClose()}
        onClick={() => inline && (open ? onClose() : onOpen())}
      >
        <span className={s.mono} aria-hidden="true" data-icon data-mono={item.mono}>
          {hasLogo(item.mono) ? <Logo name={item.mono} className={s.logo} /> : item.mono}
        </span>
        <span data-label>{item.name}</span>
      </button>
      <span
        id={noteId}
        role={inline ? undefined : "tooltip"}
        className={inline ? s.note : s.tooltip}
        data-open={open || undefined}
        data-below={below || undefined}
        hidden={inline && !open}
      >
        {item.note}
      </span>
    </li>
  );
}

export function Stack() {
  const ref = useRef<HTMLElement>(null);
  const { mode } = useMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const inline = mode === "mobile" || (mode === "reduced" && typeof window !== "undefined" && innerWidth < 1024);

  // Esc closes the open tooltip (WCAG 1.4.13).
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  useSectionMotion(ref, (m) => {
    if (m === "reduced") return;
    const q = gsap.utils.selector(ref.current);
    const grid = q(`.${s.cats}`)[0];

    if (m === "mobile") {
      gsap.from(q(`.${s.cat}`), {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      });
      return;
    }

    // Icons arrive from their hero orbit slots (Developer Spec §6).
    const icons = q("[data-icon]") as HTMLElement[];
    const labels = q("[data-label]");
    const catNames = q(`.${s.catName}`);
    gsap.set(icons, { opacity: 0, scale: 1.6 });
    gsap.set([...labels, ...catNames], { opacity: 0 });

    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 70%",
      once: true,
      onEnter: () => {
        gsap.to(catNames, { opacity: 1, duration: 0.3, stagger: 0.04 });
        gsap.fromTo(
          icons,
          {
            x: (_i, el: HTMLElement) => {
              const slot = heroSlot(el.dataset.mono ?? "");
              const r = el.getBoundingClientRect();
              return slot ? (slot.x / 1440) * innerWidth - (r.left + r.width / 2) : 0;
            },
            y: (_i, el: HTMLElement) => {
              const slot = heroSlot(el.dataset.mono ?? "");
              const r = el.getBoundingClientRect();
              return slot ? (slot.y / 900) * innerHeight - (r.top + r.height / 2) : 40;
            },
          },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.9, stagger: 0.04, ease: "power3.out", delay: 0.1 },
        );
        gsap.to(labels, { opacity: 1, duration: 0.3, stagger: 0.02, delay: 0.9 });
      },
    });
  });

  const open = (id: string) => (delay = 0) => {
    window.clearTimeout(timer.current);
    if (delay) timer.current = window.setTimeout(() => setOpenId(id), delay);
    else setOpenId(id);
  };
  const close = (id: string) => () => {
    window.clearTimeout(timer.current);
    setOpenId((cur) => (cur === id ? null : cur));
  };

  return (
    <section ref={ref} id="stack" className={`${s.section} grain`} aria-labelledby="stack-title">
      <h2 id="stack-title" className={s.title} tabIndex={-1}>
        The stack, reassembled.
      </h2>
      <p className={s.lead}>
        {inline ? "Tap any technology for where I've used it." : "Hover or focus any tile for where I've used it."}
      </p>
      <div className={s.cats}>
        {stack.map((cat) => (
          <div key={cat.name} className={s.cat}>
            <h3 className={s.catName}>{cat.name}</h3>
            <ul className={s.tiles}>
              {cat.items.map((item) => {
                const id = `tech-${item.mono.toLowerCase().replace(/[^a-z0-9]/g, "")}-${cat.name.length}`;
                return (
                  <Tile
                    key={item.name}
                    id={id}
                    item={item}
                    open={openId === id}
                    inline={inline}
                    onOpen={open(id)}
                    onClose={close(id)}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
