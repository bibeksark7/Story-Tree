"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.8;

/**
 * Downscale in the browser before upload: keeps requests around 200KB, cuts
 * vision tokens, and makes the server-side size cap almost never fire.
 */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("could not encode image");
  return blob;
}

type State = "idle" | "working" | "error";

export function CameraCapture({ parentId }: { parentId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("working");
    setMessage(null);

    try {
      const blob = await downscale(file);

      const form = new FormData();
      form.append("parentId", parentId);
      form.append("photo", new File([blob], "object.jpg", { type: "image/jpeg" }));

      const res = await fetch("/api/contribute", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(data?.message ?? "That did not work. Try again.");
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      router.push(`/n/${data.id}`);
    } catch {
      setState("error");
      setMessage("That photograph could not be read. Try another.");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/*
        Deliberately not getUserMedia. This opens the native camera on iOS and
        Android with no permission dance, degrades to a file picker on desktop,
        and cannot fail in a way that leaves a black rectangle on a projector.
      */}
      <input
        ref={inputRef}
        id="photo"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        disabled={state === "working"}
        className="sr-only"
      />

      <label
        htmlFor="photo"
        aria-disabled={state === "working"}
        className={`block w-full rounded-sm border px-5 py-5 text-center text-base transition-colors ${
          state === "working"
            ? "cursor-wait border-neutral-700 text-neutral-500"
            : "cursor-pointer border-amber-700/60 text-amber-200 hover:border-amber-500 hover:bg-amber-950/30"
        }`}
      >
        {state === "working" ? "Adding it to the inventory…" : "Photograph the object"}
      </label>

      {message && <p className="text-sm text-amber-500/80">{message}</p>}
    </div>
  );
}
