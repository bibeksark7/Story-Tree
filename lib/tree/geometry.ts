/**
 * The whole tree, derived from one number.
 *
 * Pure functions, no IO, no randomness at call time — the same post count
 * always produces the same tree, so the server and the client agree and a
 * reload never reshuffles anyone's branch.
 */

/** Vertical distance the tree gains per post. */
export const SEGMENT = 132;

/**
 * Space above the newest branch: room for the climber to keep going, and for
 * the canopy to sit without being clipped by the top of the canvas. The
 * tallest crown cluster reaches ~230 units above the crown's centre, and the
 * climber needs clear trunk beneath the canopy rather than sitting inside it,
 * so this has to comfortably exceed both.
 */
export const CROWN = 720;

/** Space below the first branch, for the base of the trunk. */
export const ROOT = 180;

// Narrow enough that a 375px phone only scales down ~25%, so the climber and
// the tap targets stay usable — a wider canvas made the climber 39px tall and
// the markers 15px — but wide enough that rotated leaf clusters on the outer
// branches are not sliced off at the screen edge.
export const WIDTH = 500;
export const CENTER = WIDTH / 2;

/** Deterministic hash → [0, 1). Same input, same output, forever. */
function noise(n: number, salt = 0): number {
  let h = Math.imul(n + salt * 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function treeHeight(count: number): number {
  return ROOT + Math.max(count, 1) * SEGMENT + CROWN;
}

/** Y of a post's branch, in SVG coordinates (0 at the top of the canvas). */
export function branchY(idx: number, count: number): number {
  return treeHeight(count) - ROOT - idx * SEGMENT;
}

/** The trunk sways as it rises, so it never reads as a drawn line. */
export function trunkX(y: number): number {
  return CENTER + Math.sin(y * 0.0042) * 30 + Math.sin(y * 0.011) * 11;
}

/** Trunk thickness tapers toward the crown. */
export function trunkWidth(idx: number, count: number): number {
  // Near enough to uniform: thick the whole way up, with only a slight flare
  // toward the base so it still sits on the ground rather than floating.
  const fromTop = Math.max(count - idx, 0);
  return 56 + Math.min(fromTop, 40) * 0.22;
}

export type Branch = {
  idx: number;
  /** Where the branch leaves the trunk. */
  x0: number;
  y0: number;
  /** Where the post hangs. */
  x1: number;
  y1: number;
  side: -1 | 1;
  /** Leaf-cluster variant, 0-2. */
  leaf: number;
};

export function branchFor(idx: number, count: number): Branch {
  const y0 = branchY(idx, count);
  const x0 = trunkX(y0);

  // Alternate sides, but not perfectly — a strict zigzag looks mechanical.
  const flip = noise(idx, 3) < 0.22;
  const side = ((idx % 2 === 0 ? 1 : -1) * (flip ? -1 : 1)) as -1 | 1;

  // Kept short enough that a rotated leaf cluster on the end still fits
  // inside the canvas on a 375px screen.
  const length = 70 + noise(idx, 1) * 44;
  const rise = 28 + noise(idx, 2) * 46;

  return {
    idx,
    x0,
    y0,
    x1: x0 + side * length,
    y1: y0 - rise,
    side,
    leaf: Math.floor(noise(idx, 5) * 3),
  };
}

/** Where the climber is: just under the newest branch. */
export function climberPosition(count: number): { x: number; y: number; facing: -1 | 1 } {
  const idx = Math.max(count, 1);
  const y = branchY(idx, count) + 26;
  const x = trunkX(y);
  return { x, y, facing: branchFor(idx, count).side };
}

export const MILESTONE_EVERY = 50;
export const PHASE_EVERY = 100;

export function isMilestone(count: number): boolean {
  return count > 0 && count % MILESTONE_EVERY === 0;
}

export function phaseOf(count: number): number {
  return Math.floor(Math.max(count - 1, 0) / PHASE_EVERY);
}

/** Posts near a given scroll position, so we never render 400 branches at once. */
export function visibleRange(count: number, scrollTop: number, viewportH: number) {
  const h = treeHeight(count);
  const top = Math.max(scrollTop - viewportH, 0);
  const bottom = Math.min(scrollTop + viewportH * 2, h);
  const hi = Math.ceil((h - ROOT - top) / SEGMENT);
  const lo = Math.floor((h - ROOT - bottom) / SEGMENT);
  return { from: Math.max(lo, 1), to: Math.min(hi, count) };
}
