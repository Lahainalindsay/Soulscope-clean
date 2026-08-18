import type { DimensionDisplay } from "../../lib/soulscopeApi";

type StructuralResonanceSignatureProps = {
  dimensions: DimensionDisplay[];
};

const constellations = [
  { id: "COG", label: "Cognitive form", color: "#61e7ec", x: 170, y: 122 },
  { id: "REG", label: "Regulatory motion", color: "#9856ff", x: 530, y: 122 },
  { id: "CAP", label: "Available capacity", color: "#b8f5ed", x: 170, y: 578 },
  { id: "EXP", label: "Expressive interface", color: "#168cff", x: 530, y: 578 },
] as const;

function statusFor(dimensions: DimensionDisplay[], constellationId: string) {
  const matching = dimensions.filter((dimension) => dimension.constellationId === constellationId);
  const eligible = matching.filter((dimension) => dimension.structuralEligible).length;
  return {
    eligible,
    total: matching.length,
    active: matching.some((dimension) => dimension.structuralEligible),
  };
}

export function StructuralResonanceSignature({ dimensions }: StructuralResonanceSignatureProps) {
  return (
    <section className="ss-structural-signature" aria-labelledby="structural-signature-title">
      <div className="ss-structural-signature-header">
        <div>
          <p className="ss-technical-label">Resonance signature</p>
          <h2 id="structural-signature-title">Structural field</h2>
        </div>
        <span className="ss-structural-badge">CALIBRATION_REQUIRED</span>
      </div>

      <svg viewBox="0 0 700 700" role="img" aria-label="Structural Resonance Signature showing canonical constellation eligibility without numeric scores">
        <defs>
          <radialGradient id="structural-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f4f6ff" stopOpacity="0.72" />
            <stop offset="0.36" stopColor="#61e7ec" stopOpacity="0.16" />
            <stop offset="1" stopColor="#06111c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="structural-flow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#61e7ec" />
            <stop offset="0.5" stopColor="#f4f6ff" />
            <stop offset="1" stopColor="#9856ff" />
          </linearGradient>
        </defs>
        <circle cx="350" cy="350" r="292" className="ss-structural-ring" />
        <circle cx="350" cy="350" r="214" className="ss-structural-ring ss-structural-ring-muted" />
        <path d="M170 122 C255 215 270 282 350 350 C430 418 445 485 530 578" className="ss-structural-flow" />
        <path d="M530 122 C445 215 430 282 350 350 C270 418 255 485 170 578" className="ss-structural-flow ss-structural-flow-secondary" />
        <path d="M170 122 Q350 232 530 122 M530 578 Q350 468 170 578" className="ss-structural-arc" />
        <circle cx="350" cy="350" r="84" fill="url(#structural-core)" />
        <circle cx="350" cy="350" r="24" className="ss-structural-core" />
        {constellations.map((constellation) => {
          const status = statusFor(dimensions, constellation.id);
          return (
            <g key={constellation.id}>
              <circle
                cx={constellation.x}
                cy={constellation.y}
                r={status.active ? 36 : 24}
                fill={constellation.color}
                opacity={status.active ? 0.2 : 0.08}
              />
              <circle
                cx={constellation.x}
                cy={constellation.y}
                r="7"
                fill={constellation.color}
                opacity={status.active ? 0.95 : 0.42}
              />
              <text x={constellation.x + 15} y={constellation.y - 8} className="ss-structural-label">
                {constellation.id}
              </text>
              <text x={constellation.x + 15} y={constellation.y + 10} className="ss-structural-status">
                {status.total ? `${status.eligible}/${status.total} eligible` : "No rows"}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="ss-structural-note">
        The field shows structural eligibility and evidence coverage only. No Dimension percentages, confidence values, State, Pattern, or Narrative are published before calibration.
      </p>
    </section>
  );
}
