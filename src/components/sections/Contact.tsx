"use client";

import { useRef } from "react";
import { links } from "@/content/site";
import { gsap, ease, ScrollTrigger } from "@/lib/gsap";
import { magnetic } from "@/lib/magnetic";
import { scrollOnFocus, useMotion, useSectionMotion } from "@/lib/motion";
import { BEZEL, boxIn, coverScreen, OPEN_FACING } from "@/lib/screen";
import { cue } from "@/lib/sound";
import { VisitSummary } from "../features/Extras";
import { Laptop } from "../Laptop";
import s from "./Contact.module.css";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useMotion();

  useSectionMotion(ref, (mode) => {
    if (mode === "reduced") return;
    const q = gsap.utils.selector(ref.current);
    // Magnetic CTAs (spec 11.9): fine pointers only.
    const offMagnetic = matchMedia("(hover: hover) and (pointer: fine)").matches
      ? magnetic(q(`.${s.pin}`)[0] as HTMLElement)
      : null;
    const laptop = q("[data-laptop]")[0];

    if (mode === "mobile") {
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: laptop, start: "top 85%", end: "bottom 35%", scrub: 0.8 },
        })
        .fromTo(laptop, { "--open": 1, "--glow": 0.7 }, { "--open": 0, "--glow": 0.2, duration: 0.85 }, 0)
        .fromTo(laptop, { "--seam": 0 }, { "--seam": 1, duration: 0.08 }, 0.85)
        .to(laptop, { "--seam": 0.6, duration: 0.07 }, 0.93);
      return () => offMagnetic?.();
    }

    // full: the page has been scrolling inside the laptop's screen. Pinned, the
    // camera pulls back out of it (mirror of the hero's dive), the headline and
    // buttons rise in around the laptop, then the lid shuts (v2 frame 8b).
    // Zoom-out: Stack's last viewport is pinned over Contact and scaled with the
    // exact transform that takes the laptop from "screen fills the view" back
    // to its place — so the page visibly shrinks into the laptop's screen.
    const pin = q(`.${s.pin}`)[0] as HTMLElement;
    const cover = () => coverScreen(boxIn(laptop as HTMLElement, pin), pin.clientWidth, pin.clientHeight);
    const PIN = 2.6; // pin length in viewports
    const ZOOM = 0.4; // span of the pull-out, in pin lengths
    const ZOOM_END = ZOOM + 0.08; // page has faded off the screen
    const SHOWN = 0.58; // headline + buttons fully in
    const stack = document.getElementById("stack");
    const page = stack?.querySelector<HTMLElement>("[data-stack-screen]") ?? null;
    // The pinned page's top edge sits (height − viewport) above the viewport top.
    const pageTop = () => (page ? page.offsetHeight - pin.clientHeight : 0);
    const zoomEnd = () => `+=${ZOOM_END * PIN * innerHeight}`;

    let lastP = 0;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: `+=${PIN * 100}%`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Sound cue as the lid passes half-closed.
          if (self.direction > 0 && self.progress > 0.78 && lastP <= 0.78) cue("lid-close");
          lastP = self.progress;
        },
      },
    });

    // The pull-out runs exactly with the scroll (scrub: true, no smoothing):
    // the page's pin is instant, so a lagging scale would let the page slide
    // off sideways while it unpins. Same start and end as Stack's pin.
    if (stack && page) {
      ScrollTrigger.create({ trigger: stack, start: "bottom bottom", end: zoomEnd, pin: true, pinSpacing: false });
    }
    const zoom = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: pin, start: "top top", end: zoomEnd, scrub: true, invalidateOnRefresh: true },
    });
    zoom.fromTo(
      laptop,
      { transformOrigin: "0 0", x: () => cover().x, y: () => cover().y, scale: () => cover().scale },
      { x: 0, y: 0, scale: 1, duration: ZOOM, ease: "power2.inOut" },
      0.02,
    );
    if (page) {
      // Clip the page to the screen opening (rounded like the frame), then glue it
      // to the display: same ease and timing as the laptop, inverse of the cover.
      zoom
        .set(
          page,
          {
            clipPath: () =>
              `inset(${pageTop() + BEZEL}px ${BEZEL}px ${BEZEL}px ${BEZEL}px round ${getComputedStyle(document.documentElement).getPropertyValue("--screen-r").trim() || "18px"})`,
          },
          0.001,
        )
        .fromTo(
          page,
          {
            x: 0,
            y: 0,
            scale: 1,
            transformOrigin: () => {
              const c = cover();
              const b = boxIn(laptop as HTMLElement, pin);
              return `${b.left + c.x}px ${pageTop() + b.top + c.y}px`;
            },
          },
          {
            x: () => -cover().x,
            y: () => -cover().y,
            scale: () => 1 / cover().scale,
            duration: ZOOM,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0.02,
        )
        .to(page, { opacity: 0, duration: ZOOM_END - ZOOM }, ZOOM);
    }
    zoom
      // The frame hands over to the clipped page and the model's bezel.
      .fromTo(document.documentElement, { "--frame-out": 0 }, { "--frame-out": 1, duration: 0.06 }, 0.02)
      // As the page fades off the screen, the screen shows its own content again.
      .fromTo(laptop, { "--blank": 1 }, { "--blank": 0, duration: ZOOM_END - ZOOM + 0.02 }, ZOOM - 0.02);

    tl
      .fromTo(laptop, { "--glow": 0 }, { "--glow": 0.7, duration: 0.3 }, 0.1)
      .fromTo(laptop, { "--open": OPEN_FACING }, { "--open": 1, duration: 0.1 }, ZOOM + 0.04)
      .fromTo(
        q(`.${s.title}, .${s.actions}, .${s.summary}`),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.04, duration: 0.12, ease: ease.expo },
        SHOWN - 0.14,
      )
      .to(laptop, { "--open": 0, "--glow": 0.2, duration: 0.24, ease: ease.power3 }, 0.66)
      .fromTo(laptop, { "--seam": 0 }, { "--seam": 1, duration: 0.05 }, 0.9)
      .to(laptop, { "--seam": 0.6, duration: 0.05 }, 0.95);

    // Focusing a link before the buttons have risen in jumps to where they show.
    const st = tl.scrollTrigger!;
    const offFocus = scrollOnFocus(ref.current!, st, () => (st.progress < SHOWN ? SHOWN : null), scrollTo);

    // Cursor light (v2 §9) — fine pointers only.
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return () => {
        offFocus();
        offMagnetic?.();
      };
    }
    const light = q(`.${s.cursorLight}`)[0];
    const xTo = gsap.quickTo(light, "x", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(light, "y", { duration: 0.8, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const r = pin.getBoundingClientRect();
      gsap.to(light, { opacity: 1, duration: 0.4, overwrite: "auto" });
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    const onLeave = () => gsap.to(light, { opacity: 0, duration: 0.6 });
    pin.addEventListener("pointermove", onMove);
    pin.addEventListener("pointerleave", onLeave);
    return () => {
      offFocus();
      offMagnetic?.();
      pin.removeEventListener("pointermove", onMove);
      pin.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <section ref={ref} id="contact" className={`${s.section} grain`} aria-labelledby="contact-title">
      <div className={s.pin}>
        <div className={s.cursorLight} aria-hidden="true" />
        <h2 id="contact-title" className={s.title} tabIndex={-1}>
          Let&rsquo;s build something <span className="gradient-text">everyone</span> can use.
        </h2>
        <ul className={s.actions}>
          <li>
            <a className={`btn btn-cta ${s.btn}`} href={links.email} data-magnetic>
              <span data-magnetic-label>Email me</span>
            </a>
          </li>
          <li>
            <a className={`btn btn-secondary ${s.btn}`} href={links.linkedin} target="_blank" rel="noopener noreferrer" data-magnetic>
              <span data-magnetic-label>
                LinkedIn <span aria-hidden="true">↗</span>
              </span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
          <li>
            <a className={`btn btn-secondary ${s.btn}`} href={links.github} target="_blank" rel="noopener noreferrer" data-magnetic>
              <span data-magnetic-label>
                GitHub <span aria-hidden="true">↗</span>
              </span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
          <li>
            <a className={`btn btn-secondary ${s.btn}`} href={links.cv} download data-magnetic>
              <span data-magnetic-label>{links.cvLabel}</span>
              <span className="sr-only">{` (${links.cvMeta})`}</span>
            </a>
          </li>
        </ul>
        <div className={s.laptop}>
          <Laptop oversample={2} />
        </div>
        <div className={s.summary}>
          <VisitSummary />
        </div>
      </div>
    </section>
  );
}
