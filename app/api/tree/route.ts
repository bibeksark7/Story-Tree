import { countPosts, recentPosts } from "@/lib/db/posts";

/** Current state of the tree, for the client to re-read after a post. */
export async function GET() {
  const [count, posts] = await Promise.all([countPosts(), recentPosts(300)]);
  return Response.json(
    {
      count,
      posts: posts.map((p) => ({
        id: p.id,
        idx: p.idx,
        kind: p.kind,
        body: p.body,
        image_url: p.image_url,
        created_at: p.created_at,
      })),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
