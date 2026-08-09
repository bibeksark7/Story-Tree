"use client";

import {
  CENTER,
  CROWN,
  ROOT,
  SEGMENT,
  WIDTH,
  branchFor,
  branchY,
  climberPosition,
  treeHeight,
  trunkWidth,
  trunkX,
} from "@/lib/tree/geometry";
import type { Phase } from "@/lib/tree/palette";
import { Climber } from "./Climber";
import type { PostSummary } from "./types";
import { ART } from "@/lib/tree/content.generated";

/**
 * Where each delivered leaf cluster's stem sits, as a fraction of the image.
 *
 * The three clusters are drawn completely differently — a round bush with its
 * stem out to the bottom-right, a hanging spray stemmed at the top-right, and
 * an upright fan stemmed at bottom-centre. Rotating each so its own stem meets
 * the branch is the difference between foliage growing out of a branch and
 * foliage floating next to one.
 */
const ATTACH: Array<{ ax: number; ay: number }> = [
  { ax: 0.86, ay: 0.79 }, // leaf-0 — round bush, stem bottom-right
  { ax: 0.71, ay: 0.07 }, // leaf-1 — hanging spray, stem top-right
  { ax: 0.5, ay: 0.94 }, // leaf-2 — upright fan, stem bottom-centre
];

const DEG = 180 / Math.PI;

/** Angle from the cluster's middle out to its stem. */
function stubAngle(v: number): number {
  const { ax, ay } = ATTACH[v];
  return Math.atan2(ay - 0.5, ax - 0.5) * DEG;
}

const CLUSTER = 104;

/** The trunk, from the ground up to where the canopy takes over. */
function trunkPath(count: number, stopY: number): string {
  const h = treeHeight(count);
  const step = 22;
  const left: string[] = [];
  const right: string[] = [];

  for (let y = h; y >= stopY; y -= step) {
    const idxAtY = (h - ROOT - y) / SEGMENT;
    const w = trunkWidth(idxAtY, count) / 2;
    const x = trunkX(y);
    left.push(`${x - w},${y}`);
    right.unshift(`${x + w},${y}`);
  }
  return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
}

/** One cluster, rotated so its own stem runs back along the branch. */
function Cluster({
  x,
  y,
  variant,
  angle,
  size = CLUSTER,
}: {
  x: number;
  y: number;
  variant: number;
  /** Direction the branch arrives from, in degrees. */
  angle: number;
  size?: number;
}) {
  const v = variant % 3;
  const { ax, ay } = ATTACH[v];
  const rotate = angle - stubAngle(v);

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} aria-hidden="true">
      <image
        href={`/tree/leaf-${v}.png`}
        x={-ax * size}
        y={-ay * size}
        width={size}
        height={size}
      />
    </g>
  );
}

/** Painted blobs, used only until the artwork lands. */
function LeafShapes({ x, y, variant, leaf, shade }: {
  x: number; y: number; variant: number; leaf: string; shade: string;
}) {
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

/**
 * The canopy. Without it the trunk simply stops, which reads as a cut-off pole
 * rather than the top of a tree. Deterministic layout, so it never reshuffles.
 */
function Crown({ cx, cy, phase }: { cx: number; cy: number; phase: Phase }) {
  const blobs: Array<[number, number, number, number]> = [
    // dx, dy, size, variant
    [0, 10, 168, 0],
    [-84, 34, 136, 0],
    [84, 30, 140, 0],
    [-52, -54, 128, 2],
    [56, -50, 132, 0],
    [0, -104, 124, 2],
    [-108, -18, 112, 0],
    [110, -22, 116, 2],
  ];

  if (!ART.leaf[0]) {
    return (
      <g aria-hidden="true">
        {blobs.map(([dx, dy, s], i) => (
          <circle key={i} cx={cx + dx} cy={cy + dy} r={s / 2.6} fill={i % 2 ? phase.leafShade : phase.leaf} />
        ))}
      </g>
    );
  }

  return (
    <g aria-hidden="true">
      {blobs.map(([dx, dy, s, v], i) => (
        <Cluster
          key={i}
          x={cx + dx}
          y={cy + dy}
          variant={v}
          // Stems point back toward the middle of the canopy.
          angle={Math.atan2(-dy, -dx) * DEG}
          size={s}
        />
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

  const topBranchY = branchY(Math.max(count, 1), count);
  const crownY = topBranchY - CROWN * 0.52;
  const trunkStop = crownY + 30;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label={`A tree grown from ${count} posts`}
    >
      {/* No sky rect: the sky is a fixed background behind this canvas, so it
          stays put while the tree scrolls past it. */}

      <ellipse cx={CENTER} cy={h} rx={WIDTH * 0.55} ry={ROOT * 0.7} fill={phase.barkShade} opacity="0.32" />

      <path d={trunkPath(count, trunkStop)} fill={phase.bark} />

      {Array.from({ length: count }, (_, i) => i + 1).map((idx) => {
        const b = branchFor(idx, count);
        const post = byIdx.get(idx);
        const isHot = highlightIdx === idx;

        // The direction the branch arrives from, so foliage sits on its end.
        const arriveAngle = Math.atan2(b.y0 - b.y1, b.x0 - b.x1) * DEG;

        return (
          <g key={idx}>
            <path
              d={`M ${b.x0} ${b.y0} Q ${(b.x0 + b.x1) / 2} ${b.y0 - 6} ${b.x1} ${b.y1}`}
              stroke={phase.bark}
              strokeWidth={Math.max(9 - Math.abs(count - idx) * 0.04, 5)}
              strokeLinecap="round"
              fill="none"
            />

            {ART.leaf[b.leaf % 3] ? (
              <Cluster x={b.x1} y={b.y1} variant={b.leaf} angle={arriveAngle} />
            ) : (
              <LeafShapes x={b.x1} y={b.y1} variant={b.leaf} leaf={phase.leaf} shade={phase.leafShade} />
            )}

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
                {/* Invisible hit area — a finger needs 44px, which is ~27 SVG
                    units at this canvas width. */}
                <circle cx={b.x1} cy={b.y1} r={27} fill="transparent" />
                <circle
                  cx={b.x1}
                  cy={b.y1}
                  r={isHot ? 19 : 15}
                  fill={post.kind === "photo" ? "#fffdf6" : "#ffffff"}
                  stroke={phase.ink}
                  strokeWidth="2.5"
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

      <Crown cx={trunkX(crownY)} cy={crownY} phase={phase} />

      <Climber x={climber.x} y={climber.y} facing={climber.facing} ink={phase.ink} phase={phaseIndex} />
    </svg>
  );
}
