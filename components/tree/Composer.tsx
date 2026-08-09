"use client";

import { useRef, useState } from "react";
import { COPY } from "@/lib/tree/content.generated";

const MAX_EDGE = 1280;
const QUALITY = 0.82;

async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
  if (!blob) throw new Error("could not encode");
  return blob;
}

/** Typing this instead of a post unlocks the alternate climber. */
const UNLOCK_WORD = "reve";

export function Composer({
  onPosted,
  onUnlock,
  ink,
}: {
  onPosted: (idx: number, milestone: number | null) => void;
  onUnlock: () => void;
  ink: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(form: FormData) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/post", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "That did not go up. Try again.");
        return;
      }
      setText("");
      if (fileRef.current) fileRef.current.value = "";
      onPosted(data.idx, data.milestone);
    } catch {
      setError("That did not go up. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function postText() {
    if (!text.trim() || busy) return;

    // The easter egg never reaches the tree — it unlocks a skin and clears.
    if (text.trim().toLowerCase() === UNLOCK_WORD) {
      setText("");
      onUnlock();
      return;
    }

    const form = new FormData();
    form.append("kind", "text");
    form.append("body", text.trim());
    await send(form);
  }

  async function postPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || busy) return;
    setBusy(true);
    try {
      const blob = await downscale(file);
      const form = new FormData();
      form.append("kind", "photo");
      form.append("photo", new File([blob], "post.jpg", { type: "image/jpeg" }));
      await send(form);
    } catch {
      setError("That photo could not be read. Try another.");
      setBusy(false);
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 p-3">
      {error && (
        <p className="mb-2 rounded bg-black/70 px-3 py-2 text-center text-sm text-white">{error}</p>
      )}

      <div className="mx-auto flex w-full max-w-md items-center gap-2 rounded-full bg-white/95 p-1.5 shadow-lg backdrop-blur">
        <input
          ref={fileRef}
          id="post-photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={postPhoto}
          disabled={busy}
          className="sr-only"
        />
        <label
          htmlFor="post-photo"
          aria-label="Add a photo"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ${
            busy ? "cursor-wait text-neutral-400" : "cursor-pointer text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          ◘
        </label>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") postText();
          }}
          disabled={busy}
          maxLength={280}
          placeholder={busy ? COPY.posting : COPY.composerPlaceholder}
          className="min-w-0 flex-1 bg-transparent px-1 text-[1rem] text-neutral-900 outline-none placeholder:text-neutral-500"
        />

        <button
          type="button"
          onClick={postText}
          disabled={busy || !text.trim()}
          className="h-10 shrink-0 rounded-full px-4 font-label text-[0.75rem] uppercase tracking-[0.14em] text-white disabled:opacity-35"
          style={{ background: ink }}
        >
          {COPY.composerButton}
        </button>
      </div>
    </div>
  );
}
