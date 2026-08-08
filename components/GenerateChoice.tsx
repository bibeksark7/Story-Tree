"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * An unwritten choice. Tapping it writes the passage, then navigates to it.
 * The wait screen proper arrives in Phase 6; this is the honest minimum.
 */
export function GenerateChoice({
  parentId,
  slot,
  label,
  className,
}: {
  parentId: string;
  slot: number;
  label: string;
  className: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "writing" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function go() {
    if (state === "writing") return;
    setState("writing");
    setMessage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ parentId, slot }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(data?.message ?? "That did not work. Try again.");
        return;
      }
      router.push(`/n/${data.id}`);
    } catch {
      setState("error");
      setMessage("The building did not answer. Try again.");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={go}
        disabled={state === "writing"}
        className={`${className} ${
          state === "writing"
            ? "cursor-wait border-neutral-700 text-neutral-500"
            : "border-neutral-800 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-900"
        }`}
      >
        {label}
        {state === "writing" && (
          <span className="ml-2 text-xs uppercase tracking-wide text-neutral-500">writing…</span>
        )}
      </button>
      {message && <p className="px-1 text-sm text-amber-500/80">{message}</p>}
    </div>
  );
}
