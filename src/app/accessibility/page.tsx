import type { Metadata } from "next";
import Link from "next/link";
import { person } from "@/content/site";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: `Accessibility statement — ${person.name}`,
};

export default function AccessibilityStatement() {
  return (
    <main className={s.page}>
      <Link href="/" className={s.back}>
        ← Back to the portfolio
      </Link>
      <h1>Accessibility statement</h1>
      <p>
        This site is built to conform with the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It is tested
        with automated checks (axe) and manually with NVDA + Firefox, JAWS + Chrome and VoiceOver on macOS and iOS.
      </p>
      <h2>Motion</h2>
      <p>
        Scroll animations follow your operating system&rsquo;s reduced-motion setting. You can also switch them off at any
        time with the &ldquo;Reduce motion&rdquo; switch in the header; your choice is remembered on this device. The
        auto-playing icon orbit in the hero can be paused with the &ldquo;Pause motion&rdquo; button.
      </p>
      <h2>Known limitations</h2>
      <p>
        The &ldquo;Before&rdquo; state of the form demonstration intentionally fails contrast and labelling requirements.
        The same information is provided as text next to it.
      </p>
      <h2>Feedback</h2>
      <p>
        If something on this site doesn&rsquo;t work for you, please get in touch — see the contact section on the home
        page.
      </p>
    </main>
  );
}
