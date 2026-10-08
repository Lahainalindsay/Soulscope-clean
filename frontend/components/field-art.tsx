import { useId } from "react";
export function FieldArt({ small = false }: { small?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`field-art ${small ? "small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 640 640" fill="none">
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#14344a" stopOpacity=".7" />
            <stop offset="1" stopColor="#020607" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`${id}-line`}
            x1="100"
            y1="100"
            x2="540"
            y2="540"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#53f2ef" />
            <stop offset=".38" stopColor="#64beff" />
            <stop offset=".58" stopColor="#be6bff" />
            <stop offset="1" stopColor="#55edee" />
          </linearGradient>
          <filter
            id={`${id}-glow`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>
        <circle cx="320" cy="320" r="300" fill={`url(#${id}-halo)`} />
        {[272, 288, 300].map((r, i) => (
          <circle
            key={r}
            cx="320"
            cy="320"
            r={r}
            stroke="#7da8ae"
            strokeOpacity={0.16 + i * 0.02}
            strokeDasharray={i === 1 ? "1 6" : undefined}
          />
        ))}
        <path d="M320 8V632M8 320H632" stroke="#73c3cb" strokeOpacity=".14" />
        {Array.from({ length: 48 }, (_, i) => {
          const points =
            Array.from({ length: 361 }, (_, j) => {
              const t = (j * Math.PI) / 180;
              const r =
                192 +
                48 * Math.cos(4 * t) +
                (i - 24) * 1.5 +
                13 * Math.sin(8 * t + i * 0.16) +
                7 * Math.cos(16 * t - i * 0.22);
              return `${j === 0 ? "M" : "L"}${(320 + r * Math.cos(t)).toFixed(2)},${(320 + r * Math.sin(t)).toFixed(2)}`;
            }).join(" ") + " Z";
          return (
            <path
              key={i}
              d={points}
              stroke={`url(#${id}-line)`}
              strokeWidth={i % 8 === 0 ? 1.2 : 0.55}
              opacity={i % 8 === 0 ? 0.8 : 0.27}
              filter={i % 12 === 0 ? `url(#${id}-glow)` : undefined}
            />
          );
        })}
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse
            key={i}
            cx="320"
            cy="320"
            rx={28 + i * 8}
            ry={54 + i * 12}
            stroke="#57e5ed"
            strokeOpacity={0.15 + (i % 3) * 0.08}
            transform={`rotate(${i * 22.5} 320 320)`}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const t = (i * Math.PI) / 4,
            r = i % 2 === 0 ? 245 : 167,
            x = 320 + r * Math.cos(t),
            y = 320 + r * Math.sin(t);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="10"
                fill={i % 2 ? "#bc7bff" : "#53efff"}
                opacity=".75"
                filter={`url(#${id}-glow)`}
              />
              <circle cx={x} cy={y} r="2.5" fill="#e5ffff" />
              <path
                d={`M${x - 12} ${y}h24M${x} ${y - 12}v24`}
                stroke="#c4feff"
                strokeWidth=".7"
              />
            </g>
          );
        })}
        <circle
          cx="320"
          cy="320"
          r="7"
          fill="#8df8ff"
          filter={`url(#${id}-glow)`}
        />
        <circle cx="320" cy="320" r="2.5" fill="white" />
      </svg>
    </div>
  );
}
export function Glyph({ type = 0 }: { type?: number }) {
  return (
    <svg className="glyph" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {type === 0 ? (
        <>
          <circle cx="24" cy="24" r="17" />
          <circle cx="24" cy="24" r="11" />
          <circle cx="24" cy="24" r="2" />
        </>
      ) : type === 1 ? (
        <>
          <circle cx="24" cy="24" r="17" />
          <path d="M6 24c6-18 12 18 18 0s12 18 18 0M9 32c5-14 11 14 16 0s11 14 16 0" />
        </>
      ) : type === 2 ? (
        <>
          <path d="m24 4 18 10v20L24 44 6 34V14L24 4Zm0 0v40M6 14l36 20M42 14 6 34M6 14l18 10 18-10M6 34l18-10 18 10" />
        </>
      ) : (
        <>
          <path d="m24 4 20 20-20 20L4 24 24 4Zm0 8 12 12-12 12-12-12 12-12ZM24 4v8M44 24H36M24 44v-8M4 24h8" />
        </>
      )}
    </svg>
  );
}
