# Serhii Kostenko — Portfolio

One-page portfolio built from the Claude Design project **"UI mockups for Portfolio"** — implements **Portfolio Mockups v2**
(`design/Portfolio Mockups v2.dc.html`, `Laptop.dc.html`, `SkillChip.dc.html`) and its Developer Spec.

## Stack

- **Next.js 16** (App Router, static prerender) + React 19 + TypeScript
- **GSAP 3** — ScrollTrigger, SplitText
- **Lenis** smooth scroll (full-motion mode only)
- **three.js** laptop model (lazy chunk, ~140 KB gzip, loaded after `load` when near the viewport)
- **simple-icons** — official logos, inlined at build time (no CDN)
- CSS Modules, Geist / Geist Mono via `next/font`

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Structure

```
src/
  app/                 layout (fonts, motion boot script), page, /accessibility
  content/site.ts      ALL copy and data — edit this to change text
  lib/gsap.ts          plugin registration
  lib/motion.tsx       motion modes, Lenis, useSectionMotion()
  components/
    Header, Footer, Laptop, SkillChip
    sections/          Hero, Intro, Journey (+ JourneyVisuals), BeforeAfter,
                       Services, Certification, Stack, Contact
design/                source mockups from Claude Design (local only, git-ignored)
```

## Motion modes (Developer Spec §0)

| mode      | when                                       | behaviour                                   |
| --------- | ------------------------------------------ | ------------------------------------------- |
| `full`    | ≥ 1024px, no reduced-motion preference     | pins, scrub, horizontal track, Lenis        |
| `mobile`  | ≤ 1023px, no reduced-motion preference     | no pins (hero lid scrub only), reveals       |
| `reduced` | OS setting or header switch                | static final states, 200ms fades only       |

- An inline script in `<head>` sets `html[data-motion]` before first paint, so CSS
  shows the correct starting frame. **Default CSS = final state**, so the page is
  complete without JS.
- Each section builds its timeline in `useSectionMotion(ref, mode => …)`; it is
  reverted and rebuilt whenever the mode changes (resize, OS setting, switch).
- The header switch stores an explicit choice in `localStorage.motion`
  (`reduced` / `full`); with no choice stored the OS setting wins.

## Signature features (Developer Spec §11) — `components/features/`

| # | Feature | Where |
|---|---------|-------|
| 1 | Screen reader mode ("Hear this page") | `ScreenReaderMode.tsx`, header |
| 2 | Vision simulation lens / full-viewport filter | `VisionSim.tsx`, header menu |
| 3 | Site-wide X-ray + JSON a11y report | `XRay.tsx`, header |
| 4 | Focus-ring cursor | `FocusCursor.tsx` |
| 5 | Dive into the code (Journey → Before/After) | `DiveBridge.tsx` |
| 6 | The page breaks, then heals | `sections/BeforeAfter.tsx` |
| 7 | Sound design (off by default, Web Audio) | `lib/sound.ts`, `Extras.tsx` |
| 8 | Companion laptop (≥ 1280px) | `Companion.tsx` |
| 9 | Magnetic buttons | `lib/magnetic.ts`, Contact |
| 10 | Scroll-speed marquee | `Marquee.tsx` |
| 11 | Keyboard easter egg | `Extras.tsx` (`TabToast`) |
| 12 | Visit summary (audit numbers from CI: `content/audit.ts`) | `Extras.tsx` (`VisitSummary`) |

`lib/a11yTree.ts` is the small role / accessible-name resolver behind 1 and 3.

## Loader (Developer Spec §10)

`components/Loader.tsx` — a focus ring draws around the name with real progress
(`lib/loadProgress.ts`: fonts + hero 3D model), then expands to the viewport and
reveals the hero. The boot script adds `html.loading` only with JS on and on the
first visit of the session (`sessionStorage["loader-seen"]`). Shown only if the
load takes > 400ms, min 900ms once visible, hard cap 4s. "Skip intro" is the
first tab stop; the page underneath is `inert` and `<main aria-busy>` until reveal.

## Open items (from the spec)

> The "Selected projects" section (§7) is intentionally omitted: case studies
> can't be published under the client's policy.


- CV PDF
  (`src/content/site.ts`, put the PDF in `public/cv.pdf`).
- Per-technology experience notes in `stack` are drafts — review them.
- Laptop: `components/laptop3d.ts` is the procedural model from "Laptop 3D"
  (Developer Spec §1, option B). There is no CSS fallback: until the model is
  ready (or without WebGL) only the floor glow shows. It reads the CSS vars
  (`--open`, `--lines`, `--glow`, `--seam`) that GSAP scrubs.
- JS budget: the spec targets ≤ 120 KB gzip; Next + React alone are ~130 KB, the
  current home page ships ~245 KB gzip.
