// All site copy lives here. Items in [brackets] are placeholders from the
// design ("Open items" in the developer spec) — replace them with real content.

export const person = {
  name: "Serhii Kostenko",
  role: "Senior Frontend Developer · Accessibility Specialist",
  /** Short line next to the name in the header. */
  tagline: "Accessibility specialist",
  headline: "Frontend Developer.",
  headlineAccent: "Accessibility Specialist.",
  intro: "10 years of building interfaces. Now making sure everyone can use them.",
};

export const links = {
  email: "mailto:kserzhio@gmail.com",
  linkedin: "https://www.linkedin.com/in/kserzhio/",
  github: "https://github.com/kserzhio",
  // TODO: CV file (put the PDF in /public).
  cv: "/cv.pdf",
  cvLabel: "Download CV · PDF",
  cvMeta: "PDF, [size] KB",
  credential: "https://www.dhs.gov/trusted-tester",
};

export const nav = [
  { id: "journey", label: "Journey" },
  { id: "accessibility", label: "Accessibility" },
  { id: "certification", label: "Certification" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
] as const;

/* ---------- Hero ---------- */

export type Chip = {
  label: string;
  /** Desktop centre point and size in the 1440×900 hero stage. */
  x: number;
  y: number;
  size: number;
  /** 0 = front (sharp) … 1 = back (blurred). */
  depth: number;
  /** Optional mobile centre point and size in the 390×330 scene box. */
  m?: { x: number; y: number; size: number; depth: number };
};

export const heroChips: Chip[] = [
  { label: "HTML", x: 178, y: 490, size: 116, depth: 0, m: { x: 43, y: 43, size: 46, depth: 0 } },
  { label: "TS", x: 1248, y: 476, size: 104, depth: 0, m: { x: 347, y: 53, size: 46, depth: 0 } },
  { label: "Node", x: 588, y: 818, size: 64, depth: 0.1 },
  { label: "Vue", x: 1118, y: 688, size: 76, depth: 0.2, m: { x: 331, y: 297, size: 42, depth: 0.3 } },
  { label: "CSS", x: 326, y: 676, size: 72, depth: 0.25 },
  { label: "WP", x: 861, y: 827, size: 54, depth: 0.45 },
  { label: "Ng", x: 414, y: 492, size: 44, depth: 0.75, m: { x: 194, y: 30, size: 36, depth: 0.5 } },
  { label: "React", x: 1030, y: 486, size: 40, depth: 0.8, m: { x: 57, y: 301, size: 42, depth: 0.3 } },
  { label: "JS", x: 135, y: 779, size: 38, depth: 0.85 },
  { label: "WCAG", x: 1300, y: 612, size: 36, depth: 0.85 },
  { label: "ARIA", x: 112, y: 626, size: 34, depth: 0.85 },
  { label: "Nuxt", x: 1314, y: 768, size: 36, depth: 0.9 },
  { label: "PHP", x: 722, y: 436, size: 32, depth: 0.9 },
];

/* ---------- Intro ---------- */

export const introText =
  "For 10 years I've built landing pages, online stores, PWAs and data dashboards. Today I help teams build interfaces that work for everyone.";

export const counters = [
  { value: 10, suffix: "+", label: "years building interfaces" },
  { value: 4, suffix: "", label: "frameworks in production" },
  { value: 1, suffix: "", label: "focus: accessibility" },
];

/* ---------- Career journey ---------- */

export type Chapter = {
  id: string;
  index: string;
  year: string;
  rail: string;
  title: string;
  titleAccent?: string;
  text: string;
  tags: string[];
  visual: "browser" | "phone" | "dashboard" | "xray";
};

export const chapters: Chapter[] = [
  {
    id: "ch1",
    index: "01",
    year: "2016",
    rail: "Landing pages & stores",
    title: "WordPress & OpenCart",
    text: "Built and optimized responsive landing pages in WordPress, and configured OpenCart plugins to run e-commerce stores.",
    tags: ["HTML", "CSS", "jQuery", "WordPress", "OpenCart"],
    visual: "browser",
  },
  {
    id: "ch2",
    index: "02",
    year: "[2017]",
    rail: "Themes & PWAs",
    title: "WordPress, Vue.js, Nuxt.js, PHP",
    text: "Custom WordPress themes for high-traffic company sites; calculators and order forms with Ajax and secure PHP-Mailer handling; fast PWAs on Nuxt.js.",
    tags: ["WordPress", "Vue.js", "Nuxt.js", "PHP", "Ajax", "PWA"],
    visual: "phone",
  },
  {
    id: "ch3",
    index: "03",
    year: "[2019]",
    rail: "Business apps",
    title: "Vue.js, Angular, Node.js",
    text: "Full-cycle business applications: Vuetify and Element UI, Angular Material, data-entry forms, role-based auth and ApexCharts / Chart.js dashboards on Node.js + MongoDB APIs.",
    tags: ["Vue.js", "Angular 2+", "Material", "ApexCharts", "Node.js", "MongoDB"],
    visual: "dashboard",
  },
  {
    id: "ch4",
    index: "04 · NOW",
    year: "[2022]",
    rail: "Accessibility",
    title: "Angular UI → ",
    titleAccent: "Accessibility",
    text: "Joined as an Angular UI developer and shifted focus to accessibility: audits, detailed issue documentation, and guidance that helps developers ship accessible interfaces.",
    tags: ["Angular", "WCAG 2.2", "Section 508", "WAI-ARIA"],
    visual: "xray",
  },
];

/* ---------- Before / After ---------- */

export const fixes = [
  {
    short: "Contrast",
    issue: "Low contrast",
    issueDetail: "Text at 1.7:1 · needs 4.5:1",
    wcag: "WCAG 1.4.3",
    fix: "Contrast 1.7 → 6.4:1",
    fixDetail: "Ink 2 for helper text, Action for button",
    code: false,
  },
  {
    short: "Labels",
    issue: "Placeholder as label",
    issueDetail: "No programmatic label",
    wcag: "WCAG 1.3.1, 3.3.2",
    fix: "Visible labels",
    fixDetail: '<label for="email">',
    code: true,
  },
  {
    short: "Focus visible",
    issue: "No visible focus",
    issueDetail: "outline: none everywhere",
    wcag: "WCAG 2.4.7",
    fix: "Focus ring",
    fixDetail: "3px Action + 2px offset · 3:1 vs bg",
    code: false,
  },
  {
    short: "Accessible names",
    issue: "Icon buttons, no name",
    issueDetail: "Close + show password",
    wcag: "WCAG 4.1.2",
    fix: "Accessible names",
    fixDetail: 'aria-label="Close"\naria-pressed="false"',
    code: true,
  },
  {
    short: "Linked error",
    issue: "Error not linked",
    issueDetail: "Not announced, color only",
    wcag: "WCAG 3.3.1",
    fix: "Linked error",
    fixDetail: 'aria-describedby="pw-error"\naria-invalid="true"',
    code: true,
  },
];

/** Simulated screen-reader transcript after N fixes (index = fixes applied). */
export const transcripts: { lines: string[]; current: number; stops: number; meaningful: number }[] = [
  { lines: ["button", "edit text", "edit text", "button", "button"], current: 4, stops: 5, meaningful: 0 },
  { lines: ["button", "edit text", "edit text", "button", "button"], current: 4, stops: 5, meaningful: 0 },
  {
    lines: [
      "Create account, heading, level 2",
      "button",
      "Email address, edit text, required",
      "Password, edit text, protected, required",
      "button",
      "Create account, button",
    ],
    current: -1,
    stops: 6,
    meaningful: 4,
  },
  {
    lines: [
      "Create account, heading, level 2",
      "button",
      "Email address, edit text, required",
      "Password, edit text, protected, required",
      "button",
      "Create account, button",
    ],
    current: 2,
    stops: 6,
    meaningful: 4,
  },
  {
    lines: [
      "Create account, dialog",
      "Close, button",
      "Email address, edit text, required",
      "Password, edit text, protected, required",
      "Show password, toggle button, not pressed",
      "Create account, button",
    ],
    current: 4,
    stops: 6,
    meaningful: 6,
  },
  {
    lines: [
      "Create account, dialog",
      "Close, button",
      "Email address, edit text, required",
      "Password, edit text, protected, invalid entry. Password must be at least 12 characters.",
      "Show password, toggle button, not pressed",
      "Create account, button",
    ],
    current: 4,
    stops: 6,
    meaningful: 6,
  },
];

export const services = [
  {
    title: "Accessibility audits",
    text: "WCAG 2.2 and Section 508 evaluations that combine automated scans with manual and assistive-technology testing.",
    tags: ["NVDA", "JAWS", "VoiceOver", "axe", "ANDI"],
  },
  {
    title: "Clear documentation",
    text: "Issue reports developers can act on: steps to reproduce, user impact, remediation guidance and acceptance criteria.",
    tags: ["Issue reports", "Remediation", "Acceptance criteria"],
  },
  {
    title: "Developer enablement",
    text: "Code reviews, accessible component patterns and training that keep teams shipping accessible UI after the audit ends.",
    tags: ["Code review", "Patterns", "Training"],
  },
];

/* ---------- Certification ---------- */

export const featuredCert = {
  title: "DHS Trusted Tester™ Certification",
  issuer: "U.S. Department of Homeland Security",
  text: "Certified to evaluate web content for Section 508 conformance using the DHS Trusted Tester process, based on the ICT Testing Baseline — delivering consistent, repeatable and reproducible accessibility test results.",
  id: "[XXXX-XXXX]",
  issued: "[Month YYYY]",
};

export const otherCerts = [
  { title: "Creating Web Projects", meta: "Computer Academy STEP · 2015–2016" },
  { title: "Database Fundamentals", meta: "SoftServe · Aug 2024" },
  { title: "JavaScript Advanced", meta: "ITEducate · Aug 2017" },
];

/* ---------- Stack ---------- */

// Experience notes are drafts based on the career chapters — review each one.
export const stack: { name: string; items: { name: string; mono: string; note: string }[] }[] = [
  {
    name: "Core",
    items: [
      { name: "HTML", mono: "HTML", note: "Semantic markup since the first landing pages — landmarks, headings and native controls first." },
      { name: "CSS / SCSS", mono: "CSS", note: "Responsive layouts, design tokens and themeable component styles in SCSS." },
      { name: "JavaScript", mono: "JS", note: "From jQuery widgets to framework apps; Ajax calculators and order forms." },
      { name: "TypeScript", mono: "TS", note: "Typed Angular and React codebases; strict types for shared component APIs." },
    ],
  },
  {
    name: "Frameworks",
    items: [
      { name: "React", mono: "Re", note: "Customer portals and an accessible component library." },
      { name: "Vue.js", mono: "Vue", note: "Business apps with Vuetify and Element UI: data-entry forms and dashboards." },
      { name: "Nuxt.js", mono: "Nx", note: "Fast, installable PWAs with offline support for ordering flows." },
      { name: "Angular", mono: "Ng", note: "Angular 2+ with Material — data-entry apps and role-based auth; today the UI layer I audit and harden." },
    ],
  },
  {
    name: "UI libraries",
    items: [
      { name: "Angular Material", mono: "Mat", note: "Forms, tables and dialogs in enterprise Angular apps — and their accessibility gaps." },
      { name: "Vuetify", mono: "Vfy", note: "Admin panels and data-entry screens for Vue business apps." },
      { name: "Element UI", mono: "El", note: "Internal tools and dashboards built on Vue 2." },
    ],
  },
  {
    name: "Data viz",
    items: [
      { name: "ApexCharts", mono: "Apx", note: "Interactive business dashboards with accessible data-table alternatives." },
      { name: "Chart.js", mono: "Cjs", note: "Lightweight reporting charts for KPIs and trends." },
    ],
  },
  {
    name: "Backend & CMS",
    items: [
      { name: "Node.js", mono: "Node", note: "REST APIs behind Vue and Angular dashboards." },
      { name: "MongoDB · integration", mono: "Mdb", note: "Integrating front ends with MongoDB-backed Node.js APIs." },
      { name: "PHP", mono: "PHP", note: "Secure PHP-Mailer form handling and WordPress theme logic." },
      { name: "WordPress", mono: "WP", note: "Custom themes for high-traffic company sites and landing pages." },
      { name: "OpenCart", mono: "OC", note: "Configured plugins and storefronts for e-commerce clients." },
    ],
  },
  {
    name: "Accessibility",
    items: [
      { name: "WCAG 2.2", mono: "2.2", note: "The AA baseline for every audit, issue report and acceptance criterion." },
      { name: "Section 508", mono: "508", note: "Federal conformance testing with the DHS Trusted Tester process." },
      { name: "WAI-ARIA", mono: "ARIA", note: "Roles, states and patterns — used only where native HTML falls short." },
      { name: "NVDA", mono: "NV", note: "Primary Windows screen reader for manual testing with Firefox and Chrome." },
      { name: "JAWS", mono: "JW", note: "Enterprise screen-reader testing with Chrome." },
      { name: "VoiceOver", mono: "VO", note: "macOS and iOS testing, including touch gestures and rotor navigation." },
      { name: "axe DevTools", mono: "axe", note: "Automated scans that start every audit — never the end of one." },
      { name: "ANDI", mono: "AN", note: "Section 508 inspection tool used in the Trusted Tester process." },
    ],
  },
];
