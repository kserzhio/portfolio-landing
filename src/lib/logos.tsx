import {
  siAngular,
  siChartdotjs,
  siCss,
  siHtml5,
  siJavascript,
  siMongodb,
  siNodedotjs,
  siNuxt,
  siPhp,
  siReact,
  siTypescript,
  siVuedotjs,
  siVuetify,
  siWordpress,
} from "simple-icons";

// Official marks from Simple Icons, rendered mono (#F5F5F7 via currentColor).
// Keyed by hero chip label / stack monogram. Technologies without a logo
// (OpenCart, Material, Element UI, ApexCharts, a11y tools) keep monograms.
const LOGOS: Record<string, { path: string }> = {
  HTML: siHtml5,
  CSS: siCss,
  JS: siJavascript,
  TS: siTypescript,
  React: siReact,
  Re: siReact,
  Vue: siVuedotjs,
  Nuxt: siNuxt,
  Nx: siNuxt,
  Ng: siAngular,
  Node: siNodedotjs,
  WP: siWordpress,
  PHP: siPhp,
  Mdb: siMongodb,
  Vfy: siVuetify,
  Cjs: siChartdotjs,
};

export const hasLogo = (key: string) => key in LOGOS;

export function Logo({ name, className }: { name: string; className?: string }) {
  const logo = LOGOS[name];
  if (!logo) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d={logo.path} fill="currentColor" />
    </svg>
  );
}
