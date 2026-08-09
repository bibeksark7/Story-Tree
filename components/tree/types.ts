export type PostSummary = {
  id: string;
  idx: number;
  kind: "text" | "photo";
  body: string | null;
  image_url: string | null;
  created_at: string;
};
