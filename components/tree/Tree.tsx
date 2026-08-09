"use client";

import {
  CENTER,
  CROWN,
  ROOT,
  SEGMENT,
  WIDTH,
  branchFor,
  climberPosition,
  treeHeight,
  trunkWidth,
  trunkX,
} from "@/lib/tree/geometry";
import type { Phase } from "@/lib/tree/palette";
import { Climber } from "./Climber";
import type { PostSummary } from "./types";
import { ART } from "@/lib/tree/content.generated";

/** The trunk as one continuous path, so it never shows a seam between posts. */
function trunkPath(count: number): string {
  const h = treeHeight(count);
  const step = 24;
  const left: string[] = [];
  const right: string[] = [];

  for (let y = h; y >= CROWN * 0.3; y -= step) {
    const idxAtY = (h - ROOT - y) / SEGMENT;
    const w = trunkWidth(idxAtY, count) / 2;
    const x = trunkX(y);
    left.push(`${x - w},${y}`);
    right.unshift(`${x + w},${y}`);
  }
  return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
}

function Leaves({ x, y, variant, leaf, shade }: {
  x: number; y: number; variant: number; leaf: string; shade: string;
}) {
  // Reve leaf art is drawn neutral green and tinted per phase here, so one set
  // of files serves every season.
  if (ART.leaf[variant % 3]) {
    const s = 92;
    return (
      <g transform={`translate(${x} ${y})`} aria-hidden="true">
        <image href={`/tree/leaf-${variant % 3}.png`} x={-s / 2} y={-s / 2} width={s} height={s} />
      </g>
    );
  }

  const blobs = [
    [[0, 0, 26], [20, -10, 19], [-19, -8, 17]],
    [[0, -4, 23], [17, 8, 16], [-16, 6, 18]],
    [[0, 0, 21], [14, -14, 16], [-15, -11, 15], [2, 15, 14]],
  ][variant % 3];

  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      {blobs.map(([dx, dy, r], i) => (
        <circle key={i} cx={dx} cy={dy} r={r} fill={i === 0 ? leaf : shade} opacity="0.95" />
      ))}
    </g>
  );
}

export function Tree({
  count,
  posts,
  phase,
  phaseIndex,
  onOpen,
  highlightIdx,
}: {
  count: number;
  posts: PostSummary[];
  phase: Phase;
  phaseIndex: number;
  onOpen: (post: PostSummary) => void;
  highlightIdx?: number;
}) {
  const h = treeHeight(count);
  const climber = climberPosition(count);
  const byIdx = new Map(posts.map((p) => [p.idx, p]));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label={`A tree grown from ${count} posts`}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={phase.skyTop} />
          <stop offset="100%" stopColor={phase.skyBottom} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={WIDTH} height={h} fill="url(#sky)" />

      {/* ground */}
      <ellipse cx={CENTER} cy={h} rx={WIDTH * 0.55} ry={ROOT * 0.7} fill={phase.barkShade} opacity="0.35" />

      <path d={trunkPath(count)} fill={phase.bark} />

      {Array.from({ length: count }, (_, i) => i + 1).map((idx) => {
        const b = branchFor(idx, count);
        const post = byIdx.get(idx);
        const isHot = highlightIdx === idx;

        return (
          <g key={idx}>
            <path
              d={`M ${b.x0} ${b.y0} Q ${(b.x0 + b.x1) / 2} ${b.y0 - 6} ${b.x1} ${b.y1}`}
              stroke={phase.bark}
              strokeWidth={Math.max(9 - Math.abs(count - idx) * 0.04, 5)}
              strokeLinecap="round"
              fill="none"
            />
            <Leaves x={b.x1} y={b.y1} variant={b.leaf} leaf={phase.leaf} shade={phase.leafShade} />

            {post && (
              <g
                className="cursor-pointer"
                onClick={() => onOpen(post)}
                role="button"
                tabIndex={0}
                aria-label={`Post ${idx}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onOpen(post);
                }}
              >
                {/* Invisible hit area. The visible marker is small so the tree
                    stays legible, but a finger needs at least 44px — which at
                    this canvas width means a radius of ~27 SVG units. */}
                <circle cx={b.x1} cy={b.y1} r={27} fill="transparent" />
                <circle
                  cx={b.x1}
                  cy={b.y1}
                  r={isHot ? 19 : 15}
                  fill={post.kind === "photo" ? phase.skyBottom : "#fff"}
                  stroke={phase.ink}
                  strokeWidth="2.5"
                  opacity="0.96"
                  style={{ pointerEvents: "none" }}
                />
                <text
                  x={b.x1}
                  y={b.y1 + 5}
                  textAnchor="middle"
                  fontSize="13"
                  fill={phase.ink}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-archivo)" }}
                >
                  {post.kind === "photo" ? "◘" : "✎"}
                </text>
              </g>
            )}
          </g>
        );
      })}

      <Climber x={climber.x} y={climber.y} facing={climber.facing} ink={phase.ink} phase={phaseIndex} />
    </svg>
  );
}
