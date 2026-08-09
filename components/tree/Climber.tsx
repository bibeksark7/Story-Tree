/**
 * The climber.
 *
 * Renders public/tree/climber-{phase}.png the moment that file exists, and
 * falls back to shapes drawn here when it does not — so artwork goes live on
 * the next deploy with no code change and no handoff.
 */
import { ART } from "@/lib/tree/content.generated";
/** He is the emotional core, so he is drawn well above incidental size. */
const SCALE = 1.7;

export function Climber({
  x,
  y,
  facing,
  ink,
  phase,
}: {
  x: number;
  y: number;
  facing: -1 | 1;
  ink: string;
  phase: number;
}) {
  const slot = phase % 4;

  if (ART.climber[slot]) {
    // Drawn from the feet up, so he stands on the branch rather than through it.
    const w = 96;
    const h = 120;
    return (
      <g transform={`translate(${x} ${y}) scale(${facing} 1)`} aria-hidden="true">
        <image href={`/tree/climber-${slot}.png`} x={-w / 2} y={-h + 22} width={w} height={h} />
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${facing * SCALE} ${SCALE})`} aria-hidden="true">
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
