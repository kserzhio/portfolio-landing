import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Loader } from "@/components/Loader";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Certification } from "@/components/sections/Certification";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Journey } from "@/components/sections/Journey";
import { Services } from "@/components/sections/Services";
import { Stack } from "@/components/sections/Stack";
import { Companion } from "@/components/features/Companion";
import { DiveBridge } from "@/components/features/DiveBridge";
import { SoundCues, TabToast } from "@/components/features/Extras";
import { FocusCursor } from "@/components/features/FocusCursor";
import { Marquee } from "@/components/features/Marquee";
import { ScreenFrame } from "@/components/features/ScreenFrame";
import { ScreenReaderMode } from "@/components/features/ScreenReaderMode";
import { VisionSim } from "@/components/features/VisionSim";
import { XRay } from "@/components/features/XRay";
import { FeaturesProvider } from "@/lib/features";
import { MotionProvider } from "@/lib/motion";

export default function Home() {
  return (
    <MotionProvider>
      <FeaturesProvider>
      <Loader />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <span id="top" />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Intro />
        <Journey />
        <DiveBridge />
        <BeforeAfter />
        <Services />
        <Certification />
        <Marquee />
        <Stack />
        <Contact />
      </main>
      <Footer />
      <ScreenFrame />
      <Companion />
      <XRay />
      <ScreenReaderMode />
      <VisionSim />
      <FocusCursor />
      <SoundCues />
      <TabToast />
      </FeaturesProvider>
    </MotionProvider>
  );
}
