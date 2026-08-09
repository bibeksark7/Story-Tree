/**
 * The tree ages. Every 100 posts it moves into the next colour phase, so the
 * whole thing visibly changes as people fill it.
 *
 * Phases cycle once you run past the end, so the tree can grow forever without
 * running out of seasons.
 */

export type Phase = {
  name: string;
  skyTop: string;
  skyBottom: string;
  bark: string;
  barkShade: string;
  leaf: string;
  leafShade: string;
  /** The field the tree stands in. */
  grass: string;
  grassShade: string;
  ink: string;
  /** Reve background art for this phase, when it lands. */
  sky?: string;
};

export const PHASES: Phase[] = [
  {
    name: "Morning",
    skyTop: "#bfe4f2",
    skyBottom: "#eef7dc",
    bark: "#8a6242",
    barkShade: "#6b4830",
    leaf: "#7cc45a",
    leafShade: "#549a3c",
    grass: "#7cbf4c",
    grassShade: "#5b9a33",
    ink: "#2b2016",
  },
  {
    name: "Long afternoon",
    skyTop: "#ffd9a0",
    skyBottom: "#ffeccd",
    bark: "#956a45",
    barkShade: "#704c2f",
    leaf: "#e0a63c",
    leafShade: "#bd7f24",
    grass: "#a3b544",
    grassShade: "#7e9134",
    ink: "#3a2412",
  },
  {
    name: "Dusk",
    skyTop: "#6b6bb0",
    skyBottom: "#f0a48c",
    bark: "#5f4536",
    barkShade: "#422e25",
    leaf: "#c05e6a",
    leafShade: "#8e4050",
    grass: "#69795a",
    grassShade: "#4b5943",
    ink: "#f2e6dc",
  },
  {
    name: "Night",
    skyTop: "#1b2447",
    skyBottom: "#3b4a7a",
    bark: "#3d3229",
    barkShade: "#282019",
    leaf: "#5b83a8",
    leafShade: "#3d5f80",
    grass: "#37564f",
    grassShade: "#25403a",
    ink: "#eaf0f7",
  },
];

export function paletteFor(phase: number): Phase {
  return PHASES[phase % PHASES.length];
}
