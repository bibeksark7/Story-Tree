import { db } from "@/lib/supabase";

/**
 * Posts per day for the last 26 weeks — the data behind the contributions
 * calendar. Counted across everyone, because the tree is shared: "how many
 * times the tree was climbed that day", not one person's private total.
 */
export async function GET() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 26 * 7);

  const { data, error } = await db
    .from("posts")
    .select("created_at")
    .eq("is_hidden", false)
    .gte("created_at", since.toISOString());

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const byDay: Record<string, number> = {};
  for (const row of data ?? []) {
    const day = String(row.created_at).slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  return Response.json(
    { since: since.toISOString().slice(0, 10), byDay },
    { headers: { "cache-control": "no-store" } },
  );
}
