// Small accessible role / name resolver for the signature features
// (screen reader mode, X-ray — Developer Spec §11). Covers the patterns this
// site uses; not a full accname implementation.

export type A11yNode = {
  el: HTMLElement;
  role: string;
  name: string;
  kind: "landmark" | "heading" | "control";
  level?: number;
};

const LANDMARK_TAGS: Record<string, string> = {
  HEADER: "banner",
  NAV: "navigation",
  MAIN: "main",
  FOOTER: "contentinfo",
  ASIDE: "complementary",
};

const text = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();

/** Is the element hidden from the accessibility tree? */
export function isHidden(el: Element): boolean {
  if (el.closest("[aria-hidden='true'], [inert], [hidden]")) return true;
  const cs = getComputedStyle(el);
  return cs.display === "none" || cs.visibility === "hidden";
}

/** Text a screen reader would read for el's subtree (skips aria-hidden parts). */
function visibleText(el: Element): string {
  let out = "";
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) out += n.textContent;
    else if (n instanceof Element && n.getAttribute("aria-hidden") !== "true") out += " " + visibleText(n);
  });
  return out.replace(/\s+/g, " ").trim();
}

export function accessibleName(el: HTMLElement): string {
  const label = el.getAttribute("aria-label");
  if (label) return label.trim();
  const by = el.getAttribute("aria-labelledby");
  if (by) {
    return by
      .split(/\s+/)
      .map((id) => {
        const t = document.getElementById(id);
        return t ? visibleText(t) || text(t) : "";
      })
      .join(" ")
      .trim();
  }
  if (el instanceof HTMLImageElement) return el.alt;
  return visibleText(el);
}

export function roleOf(el: HTMLElement): string {
  const explicit = el.getAttribute("role");
  if (explicit) return explicit;
  const tag = el.tagName;
  if (/^H[1-6]$/.test(tag)) return "heading";
  if (tag === "A" && el.hasAttribute("href")) return "link";
  if (tag === "BUTTON") return "button";
  if (tag === "INPUT") {
    const type = (el as HTMLInputElement).type;
    return type === "range" ? "slider" : type === "checkbox" ? "checkbox" : "textbox";
  }
  if (tag === "SECTION" && (el.hasAttribute("aria-labelledby") || el.hasAttribute("aria-label"))) return "region";
  if (tag === "HEADER" || tag === "FOOTER") return el.closest("main, section, article") ? "generic" : LANDMARK_TAGS[tag];
  return LANDMARK_TAGS[tag] ?? "generic";
}

const LANDMARK_ROLES = new Set(["banner", "navigation", "main", "contentinfo", "complementary", "region"]);
const CONTROL_SELECTOR = "a[href], button, input, [role='switch'], [role='slider'], [tabindex]:not([tabindex='-1'])";

/** Spoken/labelled form, e.g. `button "Email me"`, `heading, level 2`. */
export function describe(node: A11yNode, spoken = false): string {
  const { role, name, level } = node;
  if (role === "heading") return spoken ? `${name}, heading, level ${level}` : `H${level}`;
  if (role === "main" && !name) return spoken ? "Main landmark" : "main";
  if (spoken) return name ? `${name}, ${role}` : role;
  return name ? `${role} "${name.length > 32 ? name.slice(0, 30) + "…" : name}"` : role;
}

/** Landmarks, headings and controls inside `root`, in DOM order. */
export function collect(root: ParentNode = document): A11yNode[] {
  const nodes: A11yNode[] = [];
  root.querySelectorAll<HTMLElement>("header, nav, main, footer, aside, section, h1, h2, h3, h4, h5, h6, " + CONTROL_SELECTOR).forEach(
    (el) => {
      if (isHidden(el)) return;
      const role = roleOf(el);
      if (LANDMARK_ROLES.has(role)) {
        nodes.push({ el, role, name: role === "region" ? accessibleName(el) : el.getAttribute("aria-label") ?? "", kind: "landmark" });
      } else if (role === "heading") {
        nodes.push({ el, role, name: accessibleName(el), kind: "heading", level: Number(el.tagName[1]) });
      } else if (el.matches(CONTROL_SELECTOR) && role !== "generic") {
        nodes.push({ el, role, name: accessibleName(el), kind: "control" });
      }
    },
  );
  return nodes;
}

/** Sequential focus order of all focusable, visible elements. */
export function focusOrder(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(CONTROL_SELECTOR)].filter(
    (el) => !isHidden(el) && !(el as HTMLButtonElement).disabled && el.tabIndex >= 0,
  );
}

export function inViewport(el: Element, margin = 0) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > -margin && r.top < innerHeight + margin && r.right > 0 && r.left < innerWidth;
}
