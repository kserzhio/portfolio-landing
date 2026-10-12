"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Toggles for the signature features (Developer Spec §11).
export type VisionMode = "off" | "protanopia" | "deuteranopia" | "tritanopia" | "low-vision" | "cataract";
export const VISION_MODES: { id: Exclude<VisionMode, "off">; label: string }[] = [
  { id: "protanopia", label: "Protanopia" },
  { id: "deuteranopia", label: "Deuteranopia" },
  { id: "tritanopia", label: "Tritanopia" },
  { id: "low-vision", label: "Low vision" },
  { id: "cataract", label: "Cataract" },
];

type Features = {
  xray: boolean;
  setXray: (v: boolean) => void;
  reader: boolean;
  setReader: (v: boolean) => void;
  vision: VisionMode;
  setVision: (v: VisionMode) => void;
  /** Lens follows the cursor (fine pointer) vs full-viewport filter. */
  lens: boolean;
  setLens: (v: boolean) => void;
  sound: boolean;
  setSound: (v: boolean) => void;
};

const Ctx = createContext<Features | null>(null);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [xray, setXray] = useState(false);
  const [reader, setReader] = useState(false);
  const [vision, setVision] = useState<VisionMode>("off");
  const [lens, setLens] = useState(true);
  const [sound, setSoundState] = useState(false);

  // Sound is off by default; the user's choice persists.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        if (localStorage.getItem("sound") === "on") setSoundState(true);
      } catch {
        /* storage unavailable */
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const setSound = useCallback((v: boolean) => {
    setSoundState(v);
    try {
      localStorage.setItem("sound", v ? "on" : "off");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo(
    () => ({ xray, setXray, reader, setReader, vision, setVision, lens, setLens, sound, setSound }),
    [xray, reader, vision, lens, sound, setSound],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFeatures() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeatures must be used inside <FeaturesProvider>");
  return ctx;
}
