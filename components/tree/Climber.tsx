/**
 * The climber.
 *
 * Placeholder art until Reve delivers. Swapping is a one-line change: drop the
 * PNG in public/tree/climber-{phase}.png and render an <image> here instead of
 * the shapes. Everything else — position, facing, scale — stays.
 */
export function Climber({
  x,
  y,
  facing,
  ink,
}: {
  x: number;
  y: number;
  facing: -1 | 1;
  ink: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${facing} 1)`} aria-hidden="true">
      {/* back arm, reaching up */}
      <path
        d="M2 -22 L14 -44"
        stroke={ink}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* legs */}
      <path d="M-4 0 L-9 20" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M4 0 L12 16" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* body */}
      <rect x="-9" y="-26" width="18" height="28" rx="8" fill={ink} />
      {/* front arm */}
      <path d="M6 -20 L20 -36" stroke={ink} strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* head */}
      <circle cx="0" cy="-36" r="10" fill={ink} />
    </g>
  );
}
