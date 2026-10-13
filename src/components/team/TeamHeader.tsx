"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { brand, teamNav } from "@/content/team";
import { useMotion } from "@/lib/motion";
import { HeaderTools } from "../features/HeaderTools";
import s from "./team.module.css";

/**
 * /team header: brand, in-page nav, the shared "Accessibility tools" menu and
 * the consultation CTA. In-page links scroll smoothly (Lenis in full mode)
 * and move focus to the target's heading so keyboard users land there too.
 */
export function TeamHeader() {
  const { scrollTo } = useMotion();
  const headerRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute("href")!.slice(1));
      const target = id === "top" ? document.body : document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      dialogRef.current?.close();
      history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
      const focusEl =
        id === "top" ? null : target.matches("h1, h2, h3") ? target : target.querySelector<HTMLElement>("h2");
      scrollTo(id === "top" ? 0 : target, {
        offset: -(headerRef.current?.offsetHeight ?? 0) - 16,
        onComplete: () => focusEl?.focus({ preventScroll: true }),
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  const links = teamNav.map(({ id, label }) => (
    <li key={id}>
      <a href={`#${id}`} className={s.navLink}>
        {label}
      </a>
    </li>
  ));

  return (
    <header ref={headerRef} className={s.header} data-theme="light">
      <div className={s.brandRow}>
        <a href="#top" className={s.brand}>
          <span className={s.logo} aria-hidden="true">
            {brand.initial}
          </span>
          {brand.name}
        </a>
        <span className={s.brandTag}>{brand.tag}</span>
      </div>

      <nav aria-label="Main" className={s.nav}>
        <ul className={s.navList}>{links}</ul>
      </nav>

      <div className={s.headerActions}>
        <HeaderTools />
        <a href="#book" className={`${s.btn} ${s.btnInk} ${s.headerCta}`}>
          Book a free consultation
        </a>
        <button
          ref={menuButtonRef}
          type="button"
          className={`${s.btn} ${s.btnInk} ${s.menuButton}`}
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
        >
          Menu
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className={s.dialog}
        aria-label="Menu"
        onClose={() => menuButtonRef.current?.focus()}
      >
        <div className={s.dialogTop}>
          <span className={s.brand}>
            <span className={s.logo} aria-hidden="true">
              {brand.initial}
            </span>
            {brand.name}
          </span>
          <button type="button" className={`${s.btn} ${s.btnOutline} ${s.menuButton}`} onClick={() => dialogRef.current?.close()}>
            Close
          </button>
        </div>
        <nav aria-label="Main (menu)">
          <ul className={s.dialogList}>{links}</ul>
        </nav>
        <a href="#book" className={`${s.btn} ${s.btnInk} ${s.btnBlock}`}>
          Book a free consultation
        </a>
        <Link href="/" className={s.dialogBack}>
          ← Serhii Kostenko · portfolio
        </Link>
      </dialog>
    </header>
  );
}
