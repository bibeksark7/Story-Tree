import { z } from "zod";

// The 5x5 art grid. The vision model is constrained to these values, which
// makes illustration selection total.
export const DOMINANT_COLORS = ["amber", "crimson", "verdigris", "indigo", "bone"] as const;
export const MOODS = ["dormant", "restless", "tender", "ominous", "absurd"] as const;

export type DominantColor = (typeof DOMINANT_COLORS)[number];
export type Mood = (typeof MOODS)[number];

export const StoryObjectSchema = z.object({
  name: z.string().describe("Two to four words. What the thing is. No article."),
  material: z.string().describe("What it is made of. Two words maximum."),
  condition: z.string().describe("Its wear or state. Three words maximum."),
  mood: z.enum(MOODS),
  dominant_color: z.enum(DOMINANT_COLORS),
});
export type StoryObject = z.infer<typeof StoryObjectSchema>;

// One call returns both the object and the safety verdict. The object is always
// present (never nullable) so the schema stays trivially satisfiable; `verdict`
// is what decides whether we use it.
export const ExtractionSchema = z.object({
  verdict: z.enum(["ok", "reject"]),
  reject_reason: z.string().describe("Empty string when verdict is ok."),
  object: StoryObjectSchema,
});
export type Extraction = z.infer<typeof ExtractionSchema>;

// Two named choices rather than an array: structured outputs do not support
// tuple/length constraints, and named slots map directly onto slot_index 0/1.
export const NarrationSchema = z.object({
  prose: z.string().describe("70-90 words. Second person, present tense."),
  choice_a: z.string().describe("Three to six words. An action, not a question."),
  choice_b: z.string().describe("Three to six words. An action, not a question."),
});
export type Narration = z.infer<typeof NarrationSchema>;

export const GuardSchema = z.object({
  verdict: z.enum(["safe", "unsafe"]),
  reason: z.string().describe("Empty string when verdict is safe."),
});
export type Guard = z.infer<typeof GuardSchema>;
