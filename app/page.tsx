// Phase 0 only. Replaced in Phase 1 by the canon entry resolver.
import { readFileSync } from "node:fs";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function nodeCount(): Promise<string> {
  // Deliberately not `head: true`: that swallows a 404 and reports a healthy
  // looking count of 0 when the tables do not exist at all. Phase 0 exists to
  // prove the DB is alive, so a missing schema has to be loud.
  const { count, error } = await db.from("nodes").select("id", { count: "exact" }).limit(1);
  if (error) return `DB ERROR — ${error.message} (did you run supabase/schema.sql?)`;
  return String(count ?? 0);
}

function lastProbe(): string {
  try {
    return readFileSync(".probe-latency.json", "utf8");
  } catch {
    return "no probe run yet";
  }
}

export default async function Home() {
  const count = await nodeCount();
  const probe = lastProbe();

  return (
    <main className="mx-auto max-w-2xl p-16 font-mono text-sm">
      <h1 className="mb-8 text-base">the lost &amp; found — phase 0</h1>
      <p className="mb-2">nodes: {count}</p>
      <pre className="whitespace-pre-wrap text-xs opacity-70">{probe}</pre>
    </main>
  );
}
