// Fill the tree so it looks lived-in, and so a judge's own post can trigger
// the 50-post milestone in front of them.
//
//   npm run seed-tree -- 47          # grow to 47 posts
//   npm run seed-tree -- 47 --reset  # wipe first
//
// Also creates the storage bucket photos are uploaded to, if it is missing.
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const NOTES = [
  "made it through today",
  "coffee with mom, first time in months",
  "the bus was late again but the sky was doing something",
  "finished the thing I have been putting off since March",
  "my sister called for no reason",
  "found my old headphones behind the desk",
  "it rained the whole walk home and I did not mind",
  "someone held the door and said my name",
  "cooked properly instead of ordering",
  "slept eight hours",
  "the cat sat on the keyboard again",
  "handed in the application",
  "walked past the old flat and felt nothing, which is progress",
  "first run in a year, three kilometres, terrible time",
  "we fixed it at 2am and it worked",
  "bought flowers for no occasion",
  "read a whole chapter without checking my phone",
  "told her the truth",
  "the tomatoes finally came up",
  "quiet day, nothing happened, that was the good part",
];

async function ensureBucket() {
  const { data } = await db.storage.listBuckets();
  if (data?.some((b) => b.name === "posts")) {
    console.log("bucket 'posts' already exists");
    return;
  }
  const { error } = await db.storage.createBucket("posts", { public: true });
  if (error) throw new Error(`createBucket: ${error.message}`);
  console.log("created public bucket 'posts'");
}

async function main() {
  const target = Number(process.argv[2] ?? 47);
  const reset = process.argv.includes("--reset");

  await ensureBucket();

  if (reset) {
    await db.from("posts").delete().gt("idx", 0);
    console.log("cleared existing posts");
  }

  const { data: top } = await db
    .from("posts")
    .select("idx")
    .order("idx", { ascending: false })
    .limit(1)
    .maybeSingle();

  let idx = (top?.idx ?? 0) + 1;
  if (idx > target) {
    console.log(`already at ${idx - 1} posts, nothing to do`);
    return;
  }

  const rows = [];
  for (; idx <= target; idx++) {
    rows.push({
      idx,
      kind: "text",
      body: NOTES[(idx - 1) % NOTES.length],
      author_hash: "seed",
    });
  }

  const { error } = await db.from("posts").insert(rows);
  if (error) throw new Error(error.message);

  console.log(`\nTree grown to ${target} posts.`);
  console.log(`Next milestone fires at ${Math.ceil(target / 50) * 50}.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
