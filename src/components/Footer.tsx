import Link from "next/link";
import { person } from "@/content/site";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <span>© 2026 {person.name}</span>
      <ul className={s.links}>
        <li>
          <Link href="/accessibility">Accessibility statement</Link>
        </li>
        <li>Built to WCAG 2.2 AA</li>
      </ul>
    </footer>
  );
}
