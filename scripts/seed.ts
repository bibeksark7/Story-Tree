// Env comes from `tsx --env-file=.env.local` (see the "seed" npm script).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { DOMINANT_COLORS } from "@/lib/ai/schemas";

// Deliberately not `@/lib/supabase`: that module carries `import "server-only"`,
// which throws outside a React Server Component. Keeping the guard intact there
// is worth eight duplicated lines here.
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

type Passage = { index: number; prose: string; choices: [string, string] };

/**
 * content/trunk.md does not declare parentage. Its own template defines the
 * shape: passage 1 is the root, 2 follows choice A of 1, 3 follows choice B.
 * That is heap indexing — passage i attaches to passage floor(i/2), at slot 0
 * when i is even and slot 1 when odd — so it generalises if more passages are
 * added later without changing the file format.
 */
function parentOf(i: number): { parentIndex: number; slotIndex: number } | null {
  if (i === 1) return null;
  return { parentIndex: Math.floor(i / 2), slotIndex: i % 2 === 0 ? 0 : 1 };
}

function parseTrunk(md: string): Passage[] {
  // Everything before the first `---` on its own line is instructions, not content.
  const sep = md.indexOf("\n---\n");
  const body = sep === -1 ? md : md.slice(sep + 5);

  const passages: Passage[] = [];

  for (const block of body.split(/^## /m).slice(1)) {
    const lines = block.split("\n");
    const index = Number.parseInt(lines[0].trim(), 10);
    if (!Number.isFinite(index)) continue;

    const proseLines: string[] = [];
    const choices: string[] = [];

    for (const raw of lines.slice(1)) {
      const line = raw.trim();
      if (line.startsWith("- ")) choices.push(line.slice(2).trim());
      else if (line.length > 0 && choices.length === 0) proseLines.push(line);
    }

    // The file hard-wraps prose; unwrap it back into one paragraph.
    const prose = proseLines.join(" ").replace(/\s+/g, " ").trim();

    if (!prose) throw new Error(`Passage ${index} has no prose.`);
    if (choices.length !== 2) {
      throw new Error(`Passage ${index} has ${choices.length} choices, expected exactly 2.`);
    }
    passages.push({ index, prose, choices: [choices[0], choices[1]] });
  }

  passages.sort((a, b) => a.index - b.index);
  return passages;
}

/**
 * Update the prose and choices of the already-seeded trunk in place, matching
 * passages to nodes by walking the same heap structure the seed used.
 *
 * This exists because editing content/trunk.md after seeding otherwise means
 * --reset, which deletes the whole tree — including contributed branches that
 * cannot be regenerated. A wording fix should not cost anyone their object.
 */
async function refresh(passages: Passage[]): Promise<void> {
  const root = await db.from("nodes").select("id").is("parent_id", null).order("created_at").limit(1).maybeSingle();
  if (root.error || !root.data) throw new Error("No root node to refresh. Seed first.");

  const idByIndex = new Map<number, string>([[1, root.data.id]]);

  for (const p of passages) {
    if (!idByIndex.has(p.index)) {
      const rel = parentOf(p.index)!;
      const parentId = idByIndex.get(rel.parentIndex);
      if (!parentId) {
        console.log(`passage ${p.index}: no matching node in the tree, skipped`);
        continue;
      }
      const kid = await db
        .from("nodes")
        .select("id")
        .eq("parent_id", parentId)
        .eq("slot_index", rel.slotIndex)
        .maybeSingle();
      if (!kid.data) {
        console.log(`passage ${p.index}: no matching node in the tree, skipped`);
        continue;
      }
      idByIndex.set(p.index, kid.data.id);
    }

    const id = idByIndex.get(p.index)!;
    const { error } = await db
      .from("nodes")
      .update({ prose: p.prose, pending_choices: p.choices })
      .eq("id", id);
    if (error) throw new Error(`refresh passage ${p.index}: ${error.message}`);
    console.log(`passage ${p.index}  ${id}  updated (${p.prose.split(/\s+/).length} words)`);
  }

  console.log("\nTrunk text refreshed. The rest of the tree is untouched.\n");
}

async function main() {
  const reset = process.argv.includes("--reset");
  const isRefresh = process.argv.includes("--refresh");

  const md = readFileSync(resolve("content/trunk.md"), "utf8");
  const passages = parseTrunk(md);

  if (passages.length === 0) throw new Error("No passages found in content/trunk.md");
  if (passages[0].index !== 1) throw new Error("content/trunk.md must start at passage 1");

  if (isRefresh) {
    await refresh(passages);
    return;
  }

  const { count } = await db.from("nodes").select("id", { count: "exact", head: false }).limit(1);
  if ((count ?? 0) > 0) {
    if (!reset) {
      console.error(
        `\nRefusing to seed: ${count} node(s) already exist.\n` +
          `  --refresh  update the trunk's wording in place, keeping the tree\n` +
          `  --reset    delete the whole tree and start over (loses contributed branches)\n`,
      );
      process.exit(1);
    }
    // Deleting roots cascades to every descendant.
    const { error } = await db.from("nodes").delete().is("parent_id", null);
    if (error) throw new Error(`reset failed: ${error.message}`);
    console.log("reset: existing tree deleted");
  }

  const idByIndex = new Map<number, string>();

  for (const p of passages) {
    const rel = parentOf(p.index);
    const parentId = rel ? idByIndex.get(rel.parentIndex) : null;
    if (rel && !parentId) throw new Error(`Passage ${p.index} needs passage ${rel.parentIndex}, which is missing.`);

    // The trunk is the settled baseline of the story, so it reads as `dormant`.
    // Colour cycles so consecutive passages do not look identical.
    const color = DOMINANT_COLORS[(p.index - 1) % DOMINANT_COLORS.length];

    const { data, error } = await db
      .from("nodes")
      .insert({
        parent_id: parentId ?? null,
        slot_index: rel?.slotIndex ?? null,
        depth: rel ? Math.floor(Math.log2(p.index)) : 0,
        prose: p.prose,
        pending_choices: p.choices,
        art_asset: `${color}-dormant`,
      })
      .select("id")
      .single();

    if (error) throw new Error(`insert passage ${p.index}: ${error.message}`);
    idByIndex.set(p.index, data.id);

    const where = rel ? `child of ${rel.parentIndex} at slot ${rel.slotIndex}` : "root";
    console.log(`passage ${p.index}  ${data.id}  ${where}  (${p.prose.split(/\s+/).length} words)`);
  }

  console.log(`\nSeeded ${passages.length} passages. Root: /n/${idByIndex.get(1)}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
