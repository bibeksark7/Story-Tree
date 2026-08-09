const OUTLINE = "#2b2016";

export type FruitKind = "apple" | "orange" | "pear";
export const FRUITS: FruitKind[] = ["apple", "orange", "pear"];

/**
 * A single piece of fruit, drawn to match the cartoon leaf art: flat colour,
 * dark outline, one soft highlight. Sized by its longest edge.
 */
export function Fruit({
  x,
  y,
  kind,
  size = 26,
  tilt = 0,
}: {
  x: number;
  y: number;
  kind: FruitKind;
  size?: number;
  tilt?: number;
}) {
  const s = size;
  const stem = (
    <path
      d={`M 0 ${-s * 0.46} q ${s * 0.06} ${-s * 0.16} ${s * 0.18} ${-s * 0.2}`}
      stroke="#6b4a25"
      strokeWidth={s * 0.09}
      strokeLinecap="round"
      fill="none"
    />
  );

  const leaf = (
    <path
      d={`M ${s * 0.06} ${-s * 0.52} q ${s * 0.22} ${-s * 0.14} ${s * 0.3} ${s * 0.04} q ${-s * 0.2} ${s * 0.12} ${-s * 0.3} ${-s * 0.04} z`}
      fill="#5da03a"
      stroke={OUTLINE}
      strokeWidth={s * 0.05}
    />
  );

  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`} aria-hidden="true">
      {kind === "orange" && (
        <>
          <circle r={s * 0.46} fill="#f2911f" stroke={OUTLINE} strokeWidth={s * 0.08} />
          <circle cx={-s * 0.15} cy={-s * 0.15} r={s * 0.11} fill="#ffc773" opacity="0.8" />
          {stem}
        </>
      )}

      {kind === "apple" && (
        <>
          <ellipse rx={s * 0.47} ry={s * 0.44} fill="#d8453a" stroke={OUTLINE} strokeWidth={s * 0.08} />
          <ellipse cx={-s * 0.16} cy={-s * 0.14} rx={s * 0.11} ry={s * 0.08} fill="#ff8e80" opacity="0.75" />
          {stem}
          {leaf}
        </>
      )}

      {kind === "pear" && (
        <>
          <path
            d={
              `M 0 ${-s * 0.5} ` +
              `C ${s * 0.18} ${-s * 0.5} ${s * 0.22} ${-s * 0.2} ${s * 0.14} ${-s * 0.05} ` +
              `C ${s * 0.34} ${s * 0.1} ${s * 0.32} ${s * 0.5} 0 ${s * 0.5} ` +
              `C ${-s * 0.32} ${s * 0.5} ${-s * 0.34} ${s * 0.1} ${-s * 0.14} ${-s * 0.05} ` +
              `C ${-s * 0.22} ${-s * 0.2} ${-s * 0.18} ${-s * 0.5} 0 ${-s * 0.5} Z`
            }
            fill="#c3d24c"
            stroke={OUTLINE}
            strokeWidth={s * 0.08}
          />
          <ellipse cx={-s * 0.12} cy={s * 0.14} rx={s * 0.09} ry={s * 0.13} fill="#e6f08e" opacity="0.7" />
          {stem}
        </>
      )}
    </g>
  );
}
