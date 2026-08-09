// The demo kill switch.
//
// If something ugly lands in the tree mid-event, this removes it from every
// read path in one command — no deploy, no redeploy, no code change. Every
// query in lib/db filters is_hidden, so hiding a node also hides its subtree
// from the canon walk and from choice links.
//
//   npm run hide -- post <id>      the climbing tree
//   npm run hide -- node <id>      the old story (fallback demo)
//   npm run hide -- object <id>
//   npm run hide -- post <id> --unhide
//
// Env comes from `tsx --env-file=.env.local` (see the "hide" npm script).
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function main() {
  const [kind, id] = process.argv.slice(2);
  const unhide = process.argv.includes("--unhide");

  const TABLES: Record<string, string> = {
    post: "posts",     // the climbing tree
    node: "nodes",     // the old story, kept as a fallback demo
    object: "objects",
  };

  const table = TABLES[kind];
  if (!table || !id) {
    console.error("usage: npm run hide -- <post|node|object> <id> [--unhide]");
    process.exit(1);
  }
  const { data, error } = await db
    .from(table)
    .update({ is_hidden: !unhide })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    console.error(`No ${kind} with id ${id}`);
    process.exit(1);
  }

  console.log(`${kind} ${id} is now ${unhide ? "visible" : "HIDDEN"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
