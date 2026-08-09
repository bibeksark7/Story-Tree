import type { Phase } from "@/lib/tree/palette";

/**
 * The field the tree stands in.
 *
 * Deliberately outside the tree's SVG. That canvas is a fixed 500 units wide
 * and renders centred, so anything drawn inside it stops short of the screen
 * edges on a wide display — the ground looked like an island the tree was
 * sitting on. This spans the viewport instead.
 *
 * Rendered in two parts: the field behind the trunk, and a short band of grass
 * in front of it, so the trunk emerges from the ground rather than resting on
 * top of it.
 */
export function GroundBack({ phase }: { phase: Phase }) {
  return (
    <svg
      viewBox="0 0 1200 300"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[300px] w-full"
      aria-hidden="true"
    >
      <path
        d="M0 300 L0 132 Q 300 96 600 78 Q 900 96 1200 132 L1200 300 Z"
        fill={phase.grass}
      />
      <path
        d="M0 300 L0 196 Q 300 168 600 152 Q 900 168 1200 196 L1200 300 Z"
        fill={phase.grassShade}
        opacity="0.4"
      />
    </svg>
  );
}

export function GroundFront({ phase }: { phase: Phase }) {
  // Tufts along the near edge, in front of the trunk so it is planted in the
  // field rather than standing on it. Fixed positions — no reshuffling.
  const tufts = [4, 11, 19, 26, 33, 41, 48, 56, 63, 71, 78, 86, 93];

  return (
    <svg
      viewBox="0 0 1200 140"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[140px] w-full"
      aria-hidden="true"
    >
      <path d="M0 140 L0 64 Q 300 44 600 34 Q 900 44 1200 64 L1200 140 Z" fill={phase.grass} />
      {tufts.map((p, i) => {
        const x = (p / 100) * 1200;
        const y = 52 + (i % 3) * 5;
        const h = 22 + (i % 4) * 7;
        return (
          <path
            key={i}
            d={`M ${x} ${y} q 5 ${-h * 0.6} 2 ${-h} q 7 ${h * 0.55} 8 ${h}`}
            fill={phase.grassShade}
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}
