"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { links as contact, nav, person } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { HeaderTools } from "./features/HeaderTools";
import s from "./Header.module.css";

const HEADER_H = 60;

export function Header() {
  const { mode, scrollTo } = useMotion();
  const [active, setActive] = useState<string | null>(null);
  const [light, setLight] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  // Page scroll indicator: maps scroll position straight to scaleX (no easing),
  // so it's not motion — it stays on in reduced mode too.
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Pins change the page height after layout; re-measure when it changes.
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, []);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // While the header is faded out (outside the laptop's screen), it must not
  // catch clicks meant for the page. Reads the frame state the scrubbed
  // timelines write on <html> (lib/screen.ts).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (mode !== "full") {
      header.removeAttribute("data-offscreen");
      return;
    }
    const html = document.documentElement;
    const read = () => {
      const cs = getComputedStyle(html);
      const frame = parseFloat(cs.getPropertyValue("--frame-in")) - parseFloat(cs.getPropertyValue("--frame-out"));
      header.toggleAttribute("data-offscreen", !(frame > 0.5));
    };
    read();
    gsap.ticker.add(read);
    return () => gsap.ticker.remove(read);
  }, [mode]);

  // Active link + light variant over light sections. Rebuilt per mode so
  // positions include pin spacing; refreshPriority -1 = measured after pins.
  useLayoutEffect(() => {
    if (!mode) return;
    const triggers: ScrollTrigger[] = [];

    nav.forEach(({ id, href }) => {
      const el = href ? null : document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) setActive(id);
            else setActive((cur) => (cur === id ? null : cur));
          },
        }),
      );
    });

    const lightActive = new Set<Element>();
    document.querySelectorAll('main [data-theme="light"]').forEach((el) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: `top ${HEADER_H}`,
          end: `bottom ${HEADER_H}`,
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) lightActive.add(el);
            else lightActive.delete(el);
            setLight(lightActive.size > 0);
          },
        }),
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, [mode]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const heading = target.querySelector<HTMLElement>("h2");
    dialogRef.current?.close();
    history.replaceState(null, "", `#${id}`);
    scrollTo(target, {
      offset: -HEADER_H,
      onComplete: () => heading?.focus({ preventScroll: true }),
    });
  };

  const links = nav.map(({ id, label, href }) => (
    <li key={id}>
      {href ? (
        <Link href={href} className={s.link}>
          {label}
        </Link>
      ) : (
        <a
          href={`#${id}`}
          className={s.link}
          aria-current={active === id ? "true" : undefined}
          onClick={(e) => go(e, id)}
        >
          {label}
        </a>
      )}
    </li>
  ));

  return (
    <header ref={headerRef} className={s.header} data-theme={light ? "light" : undefined}>
      <div className={s.brandWrap}>
        <a href="#top" className={s.brand}>
          {person.name}
        </a>
        <span className={s.tagline}>{person.tagline}</span>
      </div>

      <nav aria-label="Main" className={s.nav}>
        <ul className={s.links}>{links}</ul>
      </nav>

      <div className={s.desktopOnly}>
        <HeaderTools />
        <a href={contact.email} className={s.emailButton}>
          Email me
        </a>
      </div>

      <div className={s.mobileOnly}>
        <button
          ref={menuButtonRef}
          type="button"
          className={s.menuButton}
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
        >
          <span className={s.burger} aria-hidden="true" />
          <span className="sr-only">Menu</span>
        </button>
      </div>

      <span className={s.progress} aria-hidden="true">
        <span ref={progressRef} />
      </span>

      <dialog
        ref={dialogRef}
        className={s.dialog}
        aria-label="Menu"
        onClose={() => menuButtonRef.current?.focus()}
      >
        <div className={s.dialogTop}>
          <span className={s.brand}>{person.name}</span>
          <button type="button" className={s.menuButton} onClick={() => dialogRef.current?.close()}>
            <span className={s.close} aria-hidden="true" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav aria-label="Main (menu)">
          <ul className={s.dialogLinks}>{links}</ul>
        </nav>
        <a href={contact.email} className={`${s.emailButton} ${s.emailWide}`}>
          Email me
        </a>
        <HeaderTools inline onAction={() => dialogRef.current?.close()} />
      </dialog>
    </header>
  );
}
