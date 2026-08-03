import { StatusBadge } from "../ui/StatusBadge";
import styles from "./SignaturePlaceholder.module.css";

export function SignaturePlaceholder() {
  return (
    <section
      className={styles.frame}
      aria-label="Visual placeholder Resonance Signature with no scientific meaning"
    >
      <div className={styles.label}>
        <StatusBadge>Visual placeholder — no scientific meaning</StatusBadge>
      </div>
      <svg className={styles.svg} viewBox="0 0 900 520" role="img" aria-labelledby="signature-placeholder-title">
        <title id="signature-placeholder-title">
          Static unified interference field placeholder for visual review only
        </title>
        <path className={`${styles.contour} ${styles.spine}`} d="M450 70 C482 150 475 210 450 260 C421 317 419 382 450 452" stroke="rgba(184,245,237,.86)" strokeWidth="3" />
        <path className={styles.contour} d="M170 270 C245 104 375 92 455 148 C552 82 702 130 752 274 C708 416 552 448 455 382 C350 452 212 402 170 270Z" stroke="rgba(97,231,236,.72)" strokeWidth="2" />
        <path className={styles.contour} d="M230 278 C285 158 390 146 458 194 C540 148 644 170 694 278 C650 374 538 390 460 334 C385 388 272 364 230 278Z" stroke="rgba(22,140,255,.58)" strokeWidth="2" />
        <path className={styles.contour} d="M285 278 C330 204 402 198 456 228 C516 198 594 214 635 282 C590 344 520 348 456 314 C402 348 328 338 285 278Z" stroke="rgba(152,86,255,.55)" strokeWidth="2" />
        <path className={styles.contour} d="M120 260 C210 54 378 38 456 116 C590 40 790 100 820 272 C776 468 584 500 456 408 C320 508 144 448 120 260Z" stroke="rgba(184,245,237,.28)" strokeWidth="1.5" />
        <circle cx="450" cy="260" r="8" fill="rgba(184,245,237,.9)" />
      </svg>
    </section>
  );
}
