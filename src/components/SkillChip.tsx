import { Logo, hasLogo } from "@/lib/logos";
import s from "./SkillChip.module.css";

/**
 * Glass tile (SkillChip.dc.html): official logo when one exists, monogram
 * otherwise. Fills its parent; size, blur and opacity come from the parent
 * so the chip can be scrubbed.
 */
export function SkillChip({ label }: { label: string }) {
  return (
    <div className={s.chip} aria-hidden="true">
      {hasLogo(label) ? <Logo name={label} className={s.logo} /> : label}
    </div>
  );
}
