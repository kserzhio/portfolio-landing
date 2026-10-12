import type { CSSProperties } from "react";
import type { Chapter } from "@/content/site";
import s from "./JourneyVisuals.module.css";

/* Decorative chapter visuals (mockups 3a–3d). Each is drawn on its own design
   grid and scales with its width; final states by default, GSAP animates
   from them in full-motion mode via the data-* hooks. */

const BARS = [
  { h: 40, c: "#5b9cff" },
  { h: 58, c: "#5b9cff" },
  { h: 48, c: "#5b9cff" },
  { h: 72, c: "#6f95fd" },
  { h: 64, c: "#8590fc" },
  { h: 52, c: "#968cfb" },
  { h: 78, c: "#a08bfa" },
  { h: 88, c: "#a78bfa" },
];

const dots = (
  <>
    <span className={s.dot} />
    <span className={s.dot} />
    <span className={s.dot} />
  </>
);

export function BrowserVisual() {
  return (
    <div className={s.visual} style={{ "--w": 560, "--h": 400 } as CSSProperties} data-visual="browser">
      <div className={s.browser}>
        <div className={s.bar}>
          {dots}
          <span className={s.url} />
        </div>
        <div className={s.page}>
          <div className={s.navRow} data-block>
            <span className={s.logo} />
            <span className={s.navLinks}>
              <span />
              <span />
              <span />
            </span>
          </div>
          <div className={s.heroRow} data-block>
            <div className={s.heroText}>
              <span style={{ width: "90%" }} className={s.h1} />
              <span style={{ width: "60%" }} className={s.h1} />
              <span style={{ width: "80%" }} className={s.p} />
              <span style={{ width: "70%" }} className={s.p} />
              <span className={s.cta} />
            </div>
            <div className={s.image} />
          </div>
          <div className={s.cards}>
            <div className={s.card} data-block />
            <div className={s.card} data-block />
            <div className={`${s.card} ${s.cardAccent}`} data-block />
          </div>
        </div>
      </div>
      <div className={s.cart} data-cart>
        <span className={s.trail} />
        Cart
        <span className={s.badge} data-badge>
          1
        </span>
      </div>
    </div>
  );
}

export function PhoneVisual() {
  return (
    <div className={s.visual} style={{ "--w": 262, "--h": 540 } as CSSProperties} data-visual="phone">
      <div className={s.phone}>
        <div className={s.phoneScreen}>
          <div className={s.status}>
            <span>9:41</span>
            <span className={s.island} />
            <span className={s.battery} />
          </div>
          <div className={s.form}>
            <span className={s.formTitle}>Order calculator</span>
            <div className={s.field}>
              <span className={s.fieldLabel}>Name</span>
              <span className={s.input}>
                <span data-type>Alex Morgan</span>
                <span className={s.ring} data-ring />
              </span>
            </div>
            <div className={s.field}>
              <span className={s.fieldLabel}>Email</span>
              <span className={s.input}>
                <span data-type>alex@company.co</span>
                <span className={s.ring} data-ring />
              </span>
            </div>
            <div className={s.field}>
              <span className={s.fieldLabel}>Quantity</span>
              <span className={`${s.input} ${s.qty}`}>
                <span>−</span>
                <span data-type>3</span>
                <span>+</span>
                <span className={s.ring} data-ring />
              </span>
            </div>
            <span className={s.send}>
              Send order
              <span className={`${s.ring} ${s.ringPill}`} data-ring data-final-ring />
            </span>
          </div>
          <div className={s.sheet} data-sheet>
            <span className={s.appIcon} />
            <span className={s.sheetText}>
              <b>Install app</b>
              <span>Works offline</span>
            </span>
            <span className={s.install}>Install</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardChrome({ xray = false }: { xray?: boolean }) {
  return (
    <>
      <div className={s.dashBar}>
        {dots}
        {xray && <span className={s.treeLabel}>ACCESSIBILITY TREE</span>}
      </div>
      <div className={s.side} data-dim>
        <span className={s.sideLogo} />
        <span className={s.sideActive} />
        <span className={s.sideLine} style={{ width: "64%" }} />
        <span className={s.sideLine} style={{ width: "55%" }} />
        <span className={s.sideLine} style={{ width: "68%" }} />
      </div>
    </>
  );
}

export function DashboardVisual() {
  return (
    <div className={s.visual} style={{ "--w": 620, "--h": 420 } as CSSProperties} data-visual="dashboard">
      <div className={s.dash}>
        <DashboardChrome />
        <div className={s.main}>
          <div className={s.mainHead}>
            <span className={s.mainTitle}>Revenue</span>
            <span className={s.export}>Export CSV</span>
          </div>
          <div className={s.kpis}>
            {["12.4k", "98.2%", "312"].map((k) => (
              <div className={s.kpi} key={k} data-kpi>
                <span />
                {k}
              </div>
            ))}
          </div>
          <div className={s.charts}>
            <div className={s.bars}>
              {BARS.map((b, i) => (
                <span key={i} data-bar style={{ height: `${b.h}%`, background: b.c }} />
              ))}
            </div>
            <div className={s.lineChart}>
              <svg viewBox="0 0 200 150" preserveAspectRatio="none">
                <polyline
                  data-line
                  pathLength={1}
                  points="0,128 30,112 60,118 90,86 120,92 150,58 180,64 200,34"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PILL = (left: number, top: number, text: string, tone: "blue" | "violet" | "outline") => ({ left, top, text, tone });
const PILLS = [
  PILL(10, 380, 'navigation "Main"', "blue"),
  PILL(206, 50, "heading, level 2", "violet"),
  PILL(428, 82, 'button "Export CSV"', "blue"),
  PILL(132, 194, 'img "Revenue by month"', "violet"),
];
const BOXES = [
  { left: 5, top: 38, width: 100, height: 376, r: 8, tone: "blue" },
  { left: 122, top: 44, width: 80, height: 30, r: 6, tone: "violet" },
  { left: 520, top: 44, width: 88, height: 30, r: 15, tone: "blue" },
  { left: 122, top: 184, width: 264, height: 224, r: 10, tone: "violet" },
  { left: 396, top: 184, width: 204, height: 224, r: 10, tone: "white" },
];
const NUMERALS = [
  { left: 14, top: 72 },
  { left: 586, top: 30 },
  { left: 114, top: 100 },
  { left: 374, top: 176 },
  { left: 584, top: 176 },
];

const pos = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [`--${k}`, v])) as CSSProperties;

export function XrayVisual() {
  return (
    <div className={s.visual} style={{ "--w": 620, "--h": 420 } as CSSProperties} data-visual="xray">
      <div className={`${s.dash} ${s.xray}`}>
        <DashboardChrome xray />
        <div className={s.main} data-dim>
          <div className={s.mainHead}>
            <span className={s.mainTitle}>Revenue</span>
            <span className={s.export}>Export CSV</span>
          </div>
          <div className={s.kpis}>
            <div className={s.kpi} />
            <div className={s.kpi} />
            <div className={s.kpi} />
          </div>
          <div className={s.charts}>
            <div className={s.kpi} />
            <div className={s.kpi} />
          </div>
        </div>
      </div>
      <div className={s.overlay}>
        <span className={s.scan} data-scan />
        {BOXES.map(({ tone, ...b }, i) => (
          <span key={i} className={s.box} data-tone={tone} data-pop style={pos(b)} />
        ))}
        {PILLS.map((p) => (
          <span key={p.text} className={s.tag} data-tone={p.tone} data-pop style={pos({ left: p.left, top: p.top })}>
            {p.text}
          </span>
        ))}
        {NUMERALS.map((n, i) => (
          <span key={i} className={s.numeral} data-numeral style={pos(n)}>
            {i + 1}
          </span>
        ))}
        <span className={s.tag} data-tone="outline" data-alt style={pos({ left: 132, top: 220 })}>
          + data table alternative
        </span>
      </div>
    </div>
  );
}

export function ChapterVisual({ kind }: { kind: Chapter["visual"] }) {
  switch (kind) {
    case "browser":
      return <BrowserVisual />;
    case "phone":
      return <PhoneVisual />;
    case "dashboard":
      return <DashboardVisual />;
    case "xray":
      return <XrayVisual />;
  }
}
