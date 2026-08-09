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
import { Fruit, FRUITS } from "./Fruit";

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

/** Radius of the canopy clip, as a fraction of the drawn image. */
const CLIP_R = 0.27;

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

/**
 * One cluster.
 *
 * `byStem` anchors the image at its own stem, which is what a branch tip needs
 * — the foliage then grows outward from the end of the branch. Inside the
 * canopy that is wrong: anchoring by the stem throws each blob away from where
 * it was placed, and rotation carries it further, which is what left a hole
 * through the middle. There, anchor by the centre instead.
 */
function Cluster({
  x,
  y,
  variant,
  angle,
  size = CLUSTER,
  byStem = true,
}: {
  x: number;
  y: number;
  variant: number;
  /** Direction the branch arrives from, in degrees. */
  angle: number;
  size?: number;
  byStem?: boolean;
}) {
  const v = variant % 3;
  const { ax, ay } = ATTACH[v];
  const ox = byStem ? ax : 0.5;
  const oy = byStem ? ay : 0.5;
  const rotate = byStem ? angle - stubAngle(v) : angle;

  // Canopy blobs show only the dense middle of the bush. The drawn stump runs
  // inward to roughly a third of the way from the centre, so a gentle trim
  // left most of it on screen — the image is drawn oversized and clipped well
  // inside that instead. `size` stays the visible diameter either way.
  const draw = byStem ? size : size / (2 * CLIP_R);

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} aria-hidden="true">
      <image
        href={`/tree/leaf-${v}.png`}
        x={-ox * draw}
        y={-oy * draw}
        width={draw}
        height={draw}
        // Canopy blobs are clipped to trim the drawn branch stump off the
        // corner. The front-most blobs have nothing over them, so a stump
        // there is simply a log floating in the leaves. Branch-tip clusters
        // are left unclipped — there the stump is the join to the branch.
        clipPath={byStem ? undefined : "url(#blob)"}
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
 * The canopy.
 *
 * Deliberately dense and heavily overlapping: spaced-out clusters read as
 * separate bushes floating in the sky, not as the top of a tree. Every blob
 * overlaps its neighbours by well over half, and they are drawn back to front
 * so the silhouette closes up into one mass. Only the round cluster is used —
 * the hanging spray and the upright fan read as individual sprigs at this
 * density.
 */
function Crown({ cx, cy, phase }: { cx: number; cy: number; phase: Phase }) {
  // dx, dy, size — back row first.
  const blobs: Array<[number, number, number]> = [
    // Outer silhouette, back row.
    [-84, 6, 148],
    [84, 2, 150],
    [-50, -56, 164],
    [52, -60, 166],
    [0, -94, 156],
    [-26, -134, 130],
    [30, -138, 128],
    [0, -170, 110],
    [-74, 50, 142],
    [76, 46, 144],
    // Middle mass — these close the hollow where the trunk used to show
    // through, and bridge the centre to the shoulders.
    [-66, -24, 156],
    [68, -28, 158],
    [-44, 58, 158],
    [46, 54, 160],
    [0, 82, 170],
    [-36, -8, 180],
    [38, -12, 182],
    [-20, 20, 178],
    [22, 16, 180],
    [0, -62, 178],
    // Front and centre, drawn last so the middle reads as solid.
    [0, 32, 190],
    [0, -32, 186],
  ];

  if (!ART.leaf[0]) {
    return (
      <g aria-hidden="true">
        {blobs.map(([dx, dy, s], i) => (
          <circle key={i} cx={cx + dx} cy={cy + dy} r={s / 2.4} fill={i % 2 ? phase.leafShade : phase.leaf} />
        ))}
      </g>
    );
  }

  return (
    <g aria-hidden="true">
      {blobs.map(([dx, dy, s], i) => (
        <Cluster
          key={i}
          x={cx + dx}
          y={cy + dy}
          variant={0}
          // Centre-anchored, so a blob lands exactly where it is placed.
          // Every cluster carries a drawn branch stump; spin each one so that
          // stump faces the middle of the canopy, where the neighbouring blobs
          // cover it. Rotating for variety instead left stumps poking out
          // through the leaves.
          byStem={false}
          angle={
            dx === 0 && dy === 0
              ? 90 - stubAngle(0)
              : Math.atan2(-dy, -dx) * DEG - stubAngle(0)
          }
          size={s}
        />
      ))}
    </g>
  );
}

/** Deterministic hash → [0, 1), so clouds never reshuffle between renders. */
function cloudNoise(n: number, salt = 0): number {
  let h = Math.imul(n + salt * 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Clouds, drawn into the canvas rather than the fixed backdrop so they scroll
 * past with the tree — different sky at different heights, instead of the same
 * two clouds following you all the way up.
 */
function Clouds({ height }: { height: number }) {
  const every = SEGMENT * 1.6;
  const rows = Math.max(Math.floor(height / every), 1);

  return (
    <g aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => {
        const y = height - i * every - cloudNoise(i, 7) * every * 0.7;
        // Alternate sides and keep clear of the trunk down the middle.
        const side = i % 2 === 0 ? 1 : -1;
        const x = CENTER + side * (108 + cloudNoise(i, 2) * 96);
        const s = 0.72 + cloudNoise(i, 3) * 0.75;
        const o = 0.5 + cloudNoise(i, 4) * 0.35;

        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
            <ellipse cx="0" cy="0" rx="52" ry="20" fill="#ffffff" />
            <circle cx="-22" cy="-8" r="20" fill="#ffffff" />
            <circle cx="6" cy="-16" r="26" fill="#ffffff" />
            <circle cx="32" cy="-6" r="18" fill="#ffffff" />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Fruit in the canopy. Placed on an ellipse around the crown's middle so it
 * lands among the leaves rather than floating off the silhouette, and hashed
 * from its index so it never moves between renders.
 */
function CrownFruit({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => {
        const a = cloudNoise(i, 31) * Math.PI * 2;
        const r = 0.34 + cloudNoise(i, 32) * 0.52;
        const x = cx + Math.cos(a) * 132 * r;
        const y = cy + Math.sin(a) * 168 * r - 18;
        return (
          <Fruit
            key={i}
            x={x}
            y={y}
            kind={FRUITS[i % 3]}
            size={24 + cloudNoise(i, 33) * 8}
            tilt={(cloudNoise(i, 34) - 0.5) * 34}
          />
        );
      })}
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
  // Low enough that the climber is only just below the foliage.
  const crownY = topBranchY - CROWN * 0.42;
  // The trunk continues up inside the canopy so the two read as one object,
  // but stops below the crown's middle — running it higher left the tip
  // showing through the upper leaves.
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
      <defs>
        <clipPath id="blob" clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.27" />
        </clipPath>
      </defs>

      {/* No sky rect: the sky is a fixed background behind this canvas, so it
          stays put while the tree scrolls past it. */}

      <Clouds height={h} />

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

            {cloudNoise(idx, 41) < 0.5 && (
              <Fruit
                x={b.x1 + (cloudNoise(idx, 42) - 0.5) * 46}
                y={b.y1 + 26 + cloudNoise(idx, 43) * 16}
                kind={FRUITS[idx % 3]}
                size={23 + cloudNoise(idx, 44) * 7}
                tilt={(cloudNoise(idx, 45) - 0.5) * 30}
              />
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
                {/* Invisible hit area — a finger needs 44px, which is ~30 SVG
                    units at this canvas width. */}
                <circle cx={b.x1} cy={b.y1} r={30} fill="transparent" />
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
      <CrownFruit cx={trunkX(crownY)} cy={crownY} />

      <Climber x={climber.x} y={climber.y} facing={climber.facing} ink={phase.ink} phase={phaseIndex} />
    </svg>
  );
}
