import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // iOS address-bar show/hide shouldn't trigger a full refresh.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText };

/** Spec tokens (Developer Spec §0). */
export const ease = {
  expo: "expo.out",
  power3: "power3.inOut",
};
