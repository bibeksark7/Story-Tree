import "server-only";
import { db } from "@/lib/supabase";

export type PostRow = {
  id: string;
  idx: number;
  kind: "text" | "photo";
  body: string | null;
  image_url: string | null;
  author_hash: string | null;
  is_hidden: boolean;
  created_at: string;
};

const COLS = "id,idx,kind,body,image_url,author_hash,is_hidden,created_at";

export async function countPosts(): Promise<number> {
  const { count, error } = await db
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("is_hidden", false);
  if (error) throw new Error(`countPosts: ${error.message}`);
  return count ?? 0;
}

export async function listPosts(from: number, to: number): Promise<PostRow[]> {
  const { data, error } = await db
    .from("posts")
    .select(COLS)
    .eq("is_hidden", false)
    .gte("idx", from)
    .lte("idx", to)
    .order("idx", { ascending: true });
  if (error) throw new Error(`listPosts: ${error.message}`);
  return (data ?? []) as PostRow[];
}

export async function recentPosts(limit: number): Promise<PostRow[]> {
  const { data, error } = await db
    .from("posts")
    .select(COLS)
    .eq("is_hidden", false)
    .order("idx", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`recentPosts: ${error.message}`);
  return (data ?? []) as PostRow[];
}

/** Posts between two milestones, oldest first — the memories reel. */
export async function postsInMilestone(milestone: number, every: number): Promise<PostRow[]> {
  return listPosts(Math.max(milestone - every + 1, 1), milestone);
}

export async function getPost(id: string): Promise<PostRow | null> {
  const { data, error } = await db
    .from("posts")
    .select(COLS)
    .eq("id", id)
    .eq("is_hidden", false)
    .maybeSingle();
  if (error) throw new Error(`getPost: ${error.message}`);
  return data as PostRow | null;
}

/**
 * Take the next position on the tree.
 *
 * `idx` has to be gap-free, so it is max+1 rather than a sequence. Two people
 * posting at the same moment both compute the same number and one loses on the
 * unique index — same 23505 pattern the story tree uses. Retry with the next
 * position rather than failing the post.
 */
export async function insertPost(input: {
  kind: "text" | "photo";
  body: string | null;
  imageUrl: string | null;
  authorHash: string;
}): Promise<PostRow> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data: top } = await db
      .from("posts")
      .select("idx")
      .order("idx", { ascending: false })
      .limit(1)
      .maybeSingle();

    const idx = (top?.idx ?? 0) + 1;

    const { data, error } = await db
      .from("posts")
      .insert({
        idx,
        kind: input.kind,
        body: input.body,
        image_url: input.imageUrl,
        author_hash: input.authorHash,
      })
      .select(COLS)
      .single();

    if (!error) return data as PostRow;
    if (error.code !== "23505") throw new Error(`insertPost: ${error.message}`);
    // Someone took that spot. Go round again.
  }
  throw new Error("insertPost: could not claim a position after 6 attempts");
}
