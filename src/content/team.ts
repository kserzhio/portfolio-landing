// Content for /team — the accessibility audit service page
// ("Audit Service Landing" design). Placeholders still to confirm before
// launch: brand name, team names and photos, certifications per person and
// the sample-report numbers (labelled as sample on the page).

export const brand = {
  name: "Lorem",
  initial: "L",
  tag: "Accessibility audits",
};

export const teamNav = [
  { id: "what", label: "What we audit" },
  { id: "process", label: "Process" },
  { id: "report", label: "Sample report" },
  { id: "standards", label: "Standards" },
  { id: "faq", label: "FAQ" },
];

export const hero = {
  before: "Every barrier in your product, ",
  mark: "found",
  after: " and fixed on paper.",
  subtitle: "against WCAG 2.2 and Section 508 — tested by hand, with the screen readers your users rely on.",
  subtitleStrong: "web apps, mobile apps and PDF documents",
  badges: [
    { t: "2.2", tone: "ink" },
    { t: "508", tone: "yellow" },
    { t: "EN", tone: "white" },
  ],
  proof: "delivered over 5 years for government, SaaS and retail teams.",
};

export const heroIssue = {
  id: "#014",
  pin: 2,
  severity: "Critical",
  title: "CVC error is shown by colour only",
  body: "Screen reader users aren’t told the field is invalid, and can’t complete payment.",
  refs: ["WCAG 1.4.1", "3.3.1", "508 E205.4"],
};

export const marqueeItems = [
  "WCAG 2.2 AA",
  "Section 508",
  "EN 301 549",
  "European Accessibility Act",
  "ADA Title II & III",
  "PDF/UA",
  "ACR / VPAT®",
  "iOS + Android",
];

export const stats = [
  { v: "100+", l: "audits delivered for web, mobile and document teams" },
  { v: "5 yrs", l: "of manual accessibility testing" },
  { v: "3", l: "product types in one audit: web, mobile, PDF" },
  { v: "0", l: "overlays or widgets sold. Ever." },
];

export const surfaces = [
  {
    id: "web",
    title: "Web apps",
    kind: "SaaS · portals · stores",
    list: [
      "Keyboard and focus order on every flow",
      "Screen reader testing on real browser pairs",
      "Forms, errors and authentication (WCAG 2.2)",
      "Zoom, reflow, contrast and motion",
    ],
    tools: "NVDA · JAWS · VoiceOver · Dragon · 400% zoom",
  },
  {
    id: "mobile",
    title: "Mobile apps",
    kind: "iOS · Android · hybrid",
    list: [
      "VoiceOver and TalkBack on real devices",
      "Touch target size and gestures",
      "Dynamic type, orientation, dark mode",
      "Native, React Native and Flutter apps",
    ],
    tools: "VoiceOver · TalkBack · Switch Control · Voice",
  },
  {
    id: "pdf",
    title: "PDF documents",
    kind: "reports · forms · statements",
    list: [
      "Tag structure and reading order",
      "Alt text, tables and form fields",
      "PDF/UA and Section 508 checks",
      "Templates, so the next PDF is right",
    ],
    tools: "PDF/UA · PAC · Acrobat · NVDA · JAWS",
  },
] as const;

export const audiences = [
  { tag: "SECTION 508", t: "US government & contractors", d: "Audits and ACRs that hold up in federal procurement." },
  { tag: "WCAG 2.2 AA", t: "Enterprise SaaS", d: "Answer accessibility questionnaires and win enterprise deals." },
  { tag: "ADA", t: "E-commerce", d: "Checkout, search and product pages every customer can finish." },
  { tag: "EAA · EN 301 549", t: "EU companies", d: "The European Accessibility Act applies since June 2025.", accent: true },
  { tag: "WHITE-LABEL", t: "Agencies", d: "Audits under your brand, delivered to your clients." },
  { tag: "TITLE II · 504", t: "Education & healthcare", d: "Portals, course content and patient documents." },
];

export const steps = [
  { n: "01", t: "Free scoping call", d: "We map products, flows, platforms and documents.", out: "fixed quote", tone: "yellow" },
  { n: "02", t: "Automated sweep", d: "axe, WAVE, ANDI and PAC across every screen.", out: "issue baseline", tone: "white" },
  { n: "03", t: "Manual & AT testing", d: "Keyboard, screen readers, zoom, voice on real devices.", out: "verified findings", tone: "white" },
  { n: "04", t: "Report & walkthrough", d: "Prioritised findings, fixes and a call with your devs.", out: "report + tickets", tone: "white" },
  { n: "05", t: "Retest & ACR", d: "We verify the fixes and document conformance.", out: "VPAT® / ACR", tone: "ink" },
];

export const reportPoints = [
  { t: "Prioritised by user impact,", d: "not just by WCAG level." },
  { t: "Steps to reproduce", d: "with screen reader output and screenshots." },
  { t: "Code-level fixes", d: "your developers can paste and adapt." },
  { t: "Mapped to every standard", d: "— WCAG 2.2, 508, EN 301 549." },
  { t: "Exports to Jira or CSV", d: "so issues land in your backlog." },
];

export const sampleReport = {
  kicker: "ACCESSIBILITY AUDIT · SAMPLE",
  title: "Checkout flow — web + iOS",
  meta: "WCAG 2.2 AA · Section 508 · 14 screens · NVDA, JAWS, VoiceOver",
  severity: [
    { l: "Critical", v: 4, tone: "critical" },
    { l: "Serious", v: 11, tone: "serious" },
    { l: "Moderate", v: 23, tone: "moderate" },
    { l: "Minor", v: 9, tone: "minor" },
  ],
  issue: {
    id: "#014",
    severity: "CRITICAL",
    criterion: "3.3.1 Error Identification · A",
    title: "Payment errors aren’t announced to screen readers",
    rows: [
      { k: "WHO", v: "Screen reader and screen magnifier users" },
      { k: "STEPS", v: "Tab to CVC, enter 2 digits, press Pay now. NVDA says nothing; only the border turns red." },
      { k: "ALSO", v: "WCAG 1.4.1 Use of Color · 508 E205.4 · EN 301 549 9.3.3.1" },
    ],
    alsoIn: "Also in: iOS checkout · step 3",
  },
};

export const principles = [
  { n: "P", l: "Perceivable" },
  { n: "O", l: "Operable" },
  { n: "U", l: "Understandable" },
  { n: "R", l: "Robust" },
];

export const standards = [
  { k: "US FEDERAL", t: "Section 508", d: "Revised 508 Standards for ICT, including the conformance report agencies ask for." },
  { k: "EUROPEAN UNION", t: "EN 301 549", d: "The harmonised standard behind the European Accessibility Act.", accent: true },
  { k: "DOCUMENTS", t: "PDF/UA", d: "ISO 14289 for tagged, screen-reader-ready PDFs." },
  { k: "US LEGAL", t: "ADA", d: "Titles II and III — WCAG is the benchmark courts and the DOJ refer to." },
];

export const team = [
  { name: "Name Surname", role: "Lead auditor · web & Section 508", certs: ["DHS Trusted Tester", "IAAP WAS"] },
  { name: "Name Surname", role: "Mobile accessibility · iOS & Android", certs: ["IAAP CPACC"] },
  { name: "Name Surname", role: "Document accessibility · PDF/UA", certs: ["IAAP CPACC"] },
];

export const atList = [
  { n: "NVDA", p: "Windows" },
  { n: "JAWS", p: "Windows" },
  { n: "VoiceOver", p: "macOS · iOS" },
  { n: "TalkBack", p: "Android" },
  { n: "Dragon", p: "Voice" },
  { n: "ZoomText", p: "Magnifier" },
  { n: "Switch Control", p: "iOS" },
  { n: "Keyboard only", p: "All" },
];

export const faq = [
  {
    q: "Isn’t an automated scan enough?",
    a: "No. Automated tools catch only a fraction of WCAG issues — they can’t tell if alt text makes sense, if focus order is logical or if a screen reader user can finish checkout. We run scans first, then test every flow by hand with assistive technology.",
  },
  {
    q: "What do we get at the end?",
    a: "A prioritised findings report with steps to reproduce, user impact, the WCAG and 508 mapping and a recommended fix for each issue. On request we also prepare an Accessibility Conformance Report (VPAT®) after retesting.",
  },
  {
    q: "How long does an audit take?",
    a: "It depends on scope — the number of screens, flows, platforms and documents. We agree a fixed timeline on the free consultation, before any work starts.",
  },
  {
    q: "Do you audit for the European Accessibility Act?",
    a: "Yes. Findings are mapped to EN 301 549, the harmonised standard behind the EAA, alongside WCAG 2.2.",
  },
  {
    q: "Will you retest after we fix things?",
    a: "Yes. A retest of reported issues is part of every audit, so you can show which barriers are closed.",
  },
  {
    q: "Is the consultation really free?",
    a: "Yes — 30 minutes with a lead auditor, no obligation. You leave with a scope and a fixed quote.",
  },
];

export const callPoints = [
  "30 minutes with a lead auditor",
  "Scope and fixed quote within 2 business days",
  "NDA signed before we look at anything private",
];

export const scopes = ["Web app", "Mobile app", "PDF documents", "Not sure yet"];
