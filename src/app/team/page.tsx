import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";
import Link from "next/link";
import { SoundCues } from "@/components/features/Extras";
import { FocusCursor } from "@/components/features/FocusCursor";
import { ScreenReaderMode } from "@/components/features/ScreenReaderMode";
import { VisionSim } from "@/components/features/VisionSim";
import { XRay } from "@/components/features/XRay";
import { ConsultForm } from "@/components/team/ConsultForm";
import { Faq } from "@/components/team/Faq";
import { StandardsBand } from "@/components/team/StandardsBand";
import { TeamHeader } from "@/components/team/TeamHeader";
import s from "@/components/team/team.module.css";
import { links } from "@/content/site";
import {
  atList,
  audiences,
  brand,
  callPoints,
  hero,
  heroIssue,
  principles,
  reportPoints,
  sampleReport,
  standards,
  stats,
  steps,
  surfaces,
  team,
} from "@/content/team";
import { FeaturesProvider } from "@/lib/features";
import { MotionProvider } from "@/lib/motion";

const sans = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-atk", display: "swap" });
const mono = Atkinson_Hyperlegible_Mono({ subsets: ["latin"], variable: "--font-atk-mono", display: "swap" });

export const metadata: Metadata = {
  title: `${brand.name} — Accessibility audits for web, mobile and PDF`,
  description:
    "Full accessibility audits of web apps, mobile apps and PDF documents against WCAG 2.2 and Section 508 — tested by hand, with the screen readers your users rely on.",
};

export const viewport: Viewport = {
  themeColor: "#f3f0e8",
  colorScheme: "light",
};

const contactAddress = links.email.replace(/^mailto:/, "");

/** "§ 02 · region · What we audit" — the design's semantic annotations; visual only. */
function Note({ n, role, label }: { n: string; role: string; label: string }) {
  return (
    <p className={s.note} aria-hidden="true">
      <b>§ {n}</b>
      <span>{role}</span>
      <span>{label}</span>
    </p>
  );
}

function Check() {
  return (
    <span className={s.check} aria-hidden="true">
      ✓
    </span>
  );
}

/* ---------- illustrations (decorative; the cards' text carries the meaning) ---------- */

function WebArt() {
  return (
    <div className={`${s.art} ${s.artWeb}`} aria-hidden="true">
      <div className={s.artWindow}>
        <div className={s.artBar}>
          <i />
          <i />
          <i />
        </div>
        <div className={s.artBody}>
          <div className={s.artButtons}>
            <span className={s.artPrimary}>
              Sign in<em>1</em>
            </span>
            <span className={s.artSecondary}>
              Pricing<em>2</em>
            </span>
          </div>
          <span className={s.artLine} style={{ width: "80%" }} />
          <span className={s.artLine} style={{ width: "60%" }} />
          <span className={s.artBlock} />
        </div>
      </div>
    </div>
  );
}

function MobileArt() {
  return (
    <div className={`${s.art} ${s.artMobile}`} aria-hidden="true">
      <div className={s.phone}>
        <div className={s.phoneScreen}>
          <span className={s.artLine} style={{ width: "70%" }} />
          <div className={s.phoneGrid}>
            <span />
            <span />
            <span data-bad />
          </div>
          <span className={s.phoneWarn}>24 × 24 min — 18px ✕</span>
          <span className={s.phoneBar} />
        </div>
      </div>
      <span className={s.artBubble}>TalkBack: &ldquo;Unlabelled, button&rdquo;</span>
    </div>
  );
}

function PdfArt() {
  return (
    <div className={`${s.art} ${s.artPdf}`} aria-hidden="true">
      <div className={s.paper}>
        <span style={{ height: 14, width: "80%", background: "var(--t-ink)" }} />
        <span />
        <span />
        <span style={{ width: "70%" }} />
        <span style={{ height: 60, background: "var(--t-alt)", marginTop: 6 }} />
        <span />
        <span style={{ width: "60%" }} />
      </div>
      <div className={s.tags}>
        <b>TAGS</b>
        <span>&lt;Document&gt;</span>
        <span>&lt;H1&gt; Annual report</span>
        <span>&lt;P&gt;</span>
        <span className={s.tagBad}>&lt;Figure&gt; alt: — ✕</span>
        <span>&lt;Table&gt; no headers ✕</span>
        <span>&lt;P&gt;</span>
      </div>
    </div>
  );
}

const ART = { web: WebArt, mobile: MobileArt, pdf: PdfArt };

export default function TeamPage() {
  return (
    <MotionProvider>
      <FeaturesProvider>
        <div className={`${s.page} ${sans.variable} ${mono.variable}`} id="top">
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <TeamHeader />

          <main id="main" tabIndex={-1}>
            {/* §01 hero */}
            <section className={s.hero} aria-labelledby="hero-title">
              <div className={s.heroText}>
                <p className={s.heroNote} aria-hidden="true">
                  <span />§ 01 · main · heading, level 1
                </p>
                <h1 id="hero-title" className={s.h1}>
                  {hero.before}
                  <mark className={s.mark}>{hero.mark}</mark>
                  {hero.after}
                </h1>
                <p className={s.lead}>
                  Full accessibility audits of <strong>{hero.subtitleStrong}</strong> {hero.subtitle}
                </p>
                <div className={s.ctaRow}>
                  <a href="#book" className={`${s.btn} ${s.btnInk} ${s.btnLg} ${s.btnRing}`}>
                    Book a free consultation <span aria-hidden="true">→</span>
                  </a>
                  <a href="#report" className={`${s.btn} ${s.btnOutline} ${s.btnLg}`}>
                    See a sample report
                  </a>
                </div>
                <div className={s.proof}>
                  <span className={s.badges} aria-hidden="true">
                    {hero.badges.map((b) => (
                      <span key={b.t} data-tone={b.tone}>
                        {b.t}
                      </span>
                    ))}
                  </span>
                  <p>
                    <strong>100+ audits</strong> {hero.proof}
                  </p>
                </div>
              </div>

              <figure className={s.heroArt}>
                <figcaption className="sr-only">
                  Example finding from an audit: a checkout page with four flagged barriers, and the detail of pin 2.
                </figcaption>
                <div className={s.checkout} aria-hidden="true">
                  <div className={s.browserBar}>
                    <i />
                    <i />
                    <i />
                    <span>your-app.com/checkout</span>
                  </div>
                  <div className={s.checkoutBody}>
                    <span className={s.checkoutTitle}>Payment details</span>
                    <span className={s.checkoutHint}>All fields are required unless marked</span>
                    <span className={s.fakeInput}>Card number</span>
                    <div className={s.twoCol}>
                      <span className={s.fakeInput}>MM / YY</span>
                      <span className={s.fakeInput} data-error>
                        CVC
                      </span>
                    </div>
                    <div className={s.payRow}>
                      <span className={s.payBtn}>Pay now</span>
                      <span className={s.fakeInput}>?</span>
                    </div>
                  </div>
                </div>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={s.pin} data-pin={n} aria-hidden="true">
                    {n}
                  </span>
                ))}
                <div className={s.issueCard}>
                  <p className={s.issueHead}>
                    <span>
                      ISSUE {heroIssue.id} · PIN {heroIssue.pin}
                    </span>
                    <span className={s.sevTag}>{heroIssue.severity}</span>
                  </p>
                  <p className={s.issueTitle}>{heroIssue.title}</p>
                  <p className={s.issueBody}>{heroIssue.body}</p>
                  <ul className={s.refs} aria-label="Breaks">
                    {heroIssue.refs.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <p className={s.srBubble}>
                  <span aria-hidden="true" />
                  NVDA: &ldquo;button&rdquo; <span className={s.srBubbleNote}>← no name</span>
                </p>
              </figure>
            </section>

            <StandardsBand />

            <section className={s.stats} aria-label="In numbers">
              <ul>
                {stats.map((st) => (
                  <li key={st.v}>
                    <strong>{st.v}</strong>
                    <span>{st.l}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* §02 what we audit */}
            <section id="what" className={s.section} aria-labelledby="what-title">
              <div className={`${s.sectionHead} ${s.headThree}`}>
                <Note n="02" role="region" label="What we audit" />
                <h2 id="what-title" tabIndex={-1} className={s.h2}>
                  One audit. Every surface your users touch.
                </h2>
                <p className={s.headAside}>
                  Scope one product or your whole portfolio. Same method, same report format, one point of contact.
                </p>
              </div>
              <div className={s.surfaces}>
                {surfaces.map((sf) => {
                  const Art = ART[sf.id];
                  return (
                    <article key={sf.id} className={s.surface} aria-labelledby={`sf-${sf.id}`}>
                      <Art />
                      <div className={s.surfaceBody}>
                        <div className={s.surfaceHead}>
                          <h3 id={`sf-${sf.id}`}>{sf.title}</h3>
                          <span>{sf.kind}</span>
                        </div>
                        <ul className={s.checkList}>
                          {sf.list.map((i) => (
                            <li key={i}>
                              <Check />
                              <span>{i}</span>
                            </li>
                          ))}
                        </ul>
                        <p className={s.surfaceTools}>
                          <span className="sr-only">Tested with: </span>
                          {sf.tools}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* §03 who it's for */}
            <section className={`${s.section} ${s.alt} ${s.split}`} aria-labelledby="who-title">
              <Note n="03" role="region" label="Who it’s for" />
              <div className={s.stack44}>
                <h2 id="who-title" className={`${s.h2} ${s.h2Sm}`}>
                  Built for teams who have to prove it.
                </h2>
                <ul className={s.audiences}>
                  {audiences.map((a) => (
                    <li key={a.t} data-accent={a.accent || undefined}>
                      <span className={s.tagInk}>{a.tag}</span>
                      <h3>{a.t}</h3>
                      <p>{a.d}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* §04 process */}
            <section id="process" className={s.section} aria-labelledby="process-title">
              <div className={s.split}>
                <Note n="04" role="region" label="list, 5 steps" />
                <div className={s.headRow}>
                  <h2 id="process-title" tabIndex={-1} className={s.h2}>
                    How an audit works
                  </h2>
                  <p className={s.headAside}>Timeline and price are fixed on the free call, before any work starts.</p>
                </div>
              </div>
              <ol className={s.steps}>
                {steps.map((st) => (
                  <li key={st.n}>
                    <span className={s.stepKey} data-tone={st.tone} aria-hidden="true">
                      {st.n}
                    </span>
                    <h3>
                      <span className="sr-only">Step {Number(st.n)}: </span>
                      {st.t}
                    </h3>
                    <p>{st.d}</p>
                    <p className={s.stepOut}>
                      <span aria-hidden="true">→ </span>
                      <span className="sr-only">Result: </span>
                      {st.out}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* §05 sample report */}
            <section id="report" className={`${s.section} ${s.dark} ${s.report}`} aria-labelledby="report-title">
              <span className={s.reportWord} aria-hidden="true">
                report
              </span>
              <div className={s.reportGrid}>
                <Note n="05" role="region" label="Sample report" />
                <div className={s.stack32}>
                  <h2 id="report-title" tabIndex={-1} className={`${s.h2} ${s.h2Xs}`}>
                    Reports your developers will <span className={s.yellowText}>actually use.</span>
                  </h2>
                  <ol className={s.points}>
                    {reportPoints.map((r, i) => (
                      <li key={r.t}>
                        <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                        <p>
                          <strong>{r.t}</strong> <span>{r.d}</span>
                        </p>
                      </li>
                    ))}
                  </ol>
                  <a
                    href={`${links.email}?subject=${encodeURIComponent("Sample accessibility report")}`}
                    className={`${s.btn} ${s.btnYellow} ${s.btnMd}`}
                  >
                    Request the sample report · PDF
                  </a>
                </div>

                <figure className={s.sample}>
                  <span className={s.sampleShadow} aria-hidden="true" />
                  <div className={s.sampleCard}>
                    <figcaption className={s.sampleHead}>
                      <span className={s.sampleKicker}>{sampleReport.kicker}</span>
                      <span className={s.sampleTitle}>{sampleReport.title}</span>
                      <span className={s.sampleMeta}>{sampleReport.meta}</span>
                      <span className={`${s.logo} ${s.sampleLogo}`} aria-hidden="true">
                        {brand.initial}
                      </span>
                    </figcaption>
                    <div className={s.sev}>
                      <span className={s.sevBar} aria-hidden="true">
                        {sampleReport.severity.map((v) => (
                          <span key={v.l} data-tone={v.tone} style={{ flex: v.v }} />
                        ))}
                      </span>
                      <ul className={s.sevLegend} aria-label="Findings by severity">
                        {sampleReport.severity.map((v) => (
                          <li key={v.l}>
                            <span data-tone={v.tone} aria-hidden="true" />
                            <b>{v.v}</b> {v.l}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={s.sampleIssue}>
                      <div className={s.stack14}>
                        <p className={s.issueTags}>
                          <b>{sampleReport.issue.id}</b>
                          <span className={s.sevTag}>{sampleReport.issue.severity}</span>
                          <span className={s.refTag}>{sampleReport.issue.criterion}</span>
                        </p>
                        <p className={s.sampleIssueTitle}>{sampleReport.issue.title}</p>
                        <dl className={s.issueRows}>
                          {sampleReport.issue.rows.map((r) => (
                            <div key={r.k}>
                              <dt>{r.k}</dt>
                              <dd>{r.v}</dd>
                            </div>
                          ))}
                        </dl>
                        <pre className={s.code} aria-label="Recommended fix">
                          <code>
                            <span className={s.codeDim}>{"<!-- Fix -->"}</span>
                            {"\n<input id=\"cvc\" "}
                            <span className={s.codeHi}>aria-invalid=&quot;true&quot;</span>
                            {"\n  "}
                            <span className={s.codeHi}>aria-describedby=&quot;cvc-err&quot;</span>
                            {">\n<p id=\"cvc-err\">Enter the 3-digit code</p>"}
                          </code>
                        </pre>
                      </div>
                      <div className={s.shot}>
                        <span className={s.shotImg} aria-hidden="true">
                          Annotated screenshot
                        </span>
                        <span className={s.shotNote}>{sampleReport.issue.alsoIn}</span>
                      </div>
                    </div>
                  </div>
                </figure>
              </div>
            </section>

            {/* §06 standards */}
            <section id="standards" className={`${s.section} ${s.split}`} aria-labelledby="standards-title">
              <Note n="06" role="region" label="Standards" />
              <div className={s.stack48}>
                <div className={s.headRow}>
                  <h2 id="standards-title" tabIndex={-1} className={s.h2}>
                    One test pass. <mark className={s.mark}>Every</mark> standard.
                  </h2>
                  <p className={s.headAside}>
                    Each finding is mapped to every standard it breaks, so one fix closes it everywhere.
                  </p>
                </div>
                <ul className={s.bento}>
                  <li className={s.bentoMain}>
                    <span className={s.bentoKicker}>PRIMARY BASELINE</span>
                    <h3 className={s.bentoBig}>WCAG 2.2</h3>
                    <p>
                      Level A and AA — all 55 success criteria, including the nine added in 2.2 such as Focus Not
                      Obscured, Target Size and Accessible Authentication.
                    </p>
                    <ul className={s.principles} aria-label="The four principles">
                      {principles.map((p) => (
                        <li key={p.n}>
                          <span aria-hidden="true">{p.n}</span>
                          <span>{p.l}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                  {standards.map((st) => (
                    <li key={st.t} className={s.bentoCard} data-accent={st.accent || undefined}>
                      <span className={s.bentoKey}>{st.k}</span>
                      <h3>{st.t}</h3>
                      <p>{st.d}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* §07 team */}
            <section id="team" className={`${s.section} ${s.alt} ${s.split}`} aria-labelledby="team-title">
              <Note n="07" role="region" label="Team" />
              <div className={s.stack48}>
                <div className={s.headRow}>
                  <h2 id="team-title" tabIndex={-1} className={s.h2}>
                    Auditors, not scanners.
                  </h2>
                  <p className={s.headAside}>
                    Every audit is run by certified people who test with assistive technology daily. Automated tools are
                    where we start, not where we stop.
                  </p>
                </div>
                <div className={s.teamGrid}>
                  <ul className={s.members}>
                    {team.map((m, i) => (
                      <li key={i} className={s.member}>
                        <span className={s.portrait} aria-hidden="true">
                          Portrait
                        </span>
                        <div className={s.memberBody}>
                          <h3>{m.name}</h3>
                          <p>{m.role}</p>
                          <ul className={s.certs} aria-label="Certifications">
                            {m.certs.map((c) => (
                              <li key={c}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className={s.atCard}>
                    <h3 id="at-title">WE TEST WITH</h3>
                    <ul aria-labelledby="at-title">
                      {atList.map((t) => (
                        <li key={t.n}>
                          {t.n}
                          <span>
                            <span className="sr-only">, </span>
                            {t.p}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* §08 FAQ */}
            <section id="faq" className={`${s.section} ${s.faq}`} aria-labelledby="faq-title">
              <Note n="08" role="region" label="FAQ · 6 buttons" />
              <div className={s.stack20}>
                <h2 id="faq-title" tabIndex={-1} className={s.h2}>
                  Questions we hear first
                </h2>
                <p className={s.headAside}>Something else? Ask on the free call.</p>
              </div>
              <Faq />
            </section>

            {/* §09 consultation */}
            <section id="book" className={`${s.section} ${s.dark} ${s.book}`} aria-labelledby="book-title">
              <div className={s.bookGrid}>
                <Note n="09" role="form" label="Book a consultation" />
                <div className={s.stack32}>
                  <h2 id="book-title" tabIndex={-1} className={`${s.h2} ${s.h2Xl}`}>
                    Find out what&rsquo;s <mark className={s.mark}>blocking</mark> your users.
                  </h2>
                  <p className={s.bookLead}>
                    A free 30-minute call with a lead auditor. We look at your product together, agree the scope and send
                    a fixed quote.
                  </p>
                  <ul className={s.callPoints}>
                    {callPoints.map((c) => (
                      <li key={c}>
                        <Check />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <ConsultForm />
              </div>
            </section>
          </main>

          <footer className={s.footer}>
            <div className={s.footerGrid}>
              <p className={s.footerBrand}>
                <span className={`${s.logo} ${s.logoYellow}`} aria-hidden="true">
                  {brand.initial}
                </span>
                {brand.name}
              </p>
              <div>
                <Link href="/accessibility" className={s.footerStrong}>
                  Accessibility statement
                </Link>
                <p>This site conforms to WCAG 2.2 AA. Last reviewed 13 October 2026.</p>
              </div>
              <div>
                <h2 className={s.footerStrong}>Contact</h2>
                <p>
                  <a href={links.email}>{contactAddress}</a>
                </p>
              </div>
              <div>
                <h2 className={s.footerStrong}>Found a barrier on this site?</h2>
                <p>
                  <a href={`${links.email}?subject=${encodeURIComponent("Accessibility barrier on /team")}`}>Tell us</a> —
                  we fix reported issues within 5 business days.
                </p>
              </div>
            </div>
            <Link href="/" className={s.footerBack}>
              ← Serhii Kostenko · portfolio
            </Link>
          </footer>

          <XRay />
          <ScreenReaderMode />
          <VisionSim />
          <FocusCursor />
          <SoundCues />
        </div>
      </FeaturesProvider>
    </MotionProvider>
  );
}
