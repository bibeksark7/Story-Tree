"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LedgerWait } from "./LedgerWait";

/** Never written by the narrator. Deterministic, always correctly worded. */
export const CONTRIBUTE_LABEL = "Leave something here";

export type Choice = {
  label: string;
  slotIndex: number;
  childId: string | null;
};

const row =
  "block w-full border-b border-paper-deep px-1 py-4 text-left text-[1.0625rem] leading-snug transition-colors";

export function Choices({
  nodeId,
  choices,
  showContribute = false,
}: {
  nodeId: string;
  choices: Choice[];
  showContribute?: boolean;
}) {
  const router = useRouter();
  const [writing, setWriting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function generate(slot: number, label: string) {
    if (writing) return;
    setWriting(label);
    setMessage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ parentId: nodeId, slot }),
      });
      const data = await res.json();

      if (!res.ok) {
        setWriting(null);
        setMessage(data?.message ?? "That corridor did not open. Try the other one.");
        return;
      }
      router.push(`/n/${data.id}`);
    } catch {
      setWriting(null);
      setMessage("The building did not answer. Try again.");
    }
  }

  if (writing) return <LedgerWait location={writing} />;

  return (
    <nav className="mt-7 border-t border-paper-deep">
      {choices.map((choice) =>
        choice.childId ? (
          <Link
            key={choice.slotIndex}
            href={`/n/${choice.childId}`}
            className={`${row} text-ink hover:bg-paper-lit`}
          >
            {choice.label}
          </Link>
        ) : (
          <button
            key={choice.slotIndex}
            type="button"
            onClick={() => generate(choice.slotIndex, choice.label)}
            className={`${row} text-ink hover:bg-paper-lit`}
          >
            {choice.label}
          </button>
        ),
      )}

      {showContribute && (
        // The one action that changes the building, so it is tagged rather than
        // listed: a tied-on label in stamp ink.
        <Link
          href={`/n/${nodeId}/contribute`}
          className="mt-5 block border border-dashed border-stamp/45 px-4 py-4 text-[1.0625rem] text-stamp transition-colors hover:bg-stamp/[0.06]"
        >
          {CONTRIBUTE_LABEL}
        </Link>
      )}

      {message && <p className="mt-4 font-label text-[0.8125rem] text-stamp">{message}</p>}
    </nav>
  );
}
