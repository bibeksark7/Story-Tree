"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Phase } from "@/lib/tree/palette";
import type { PostSummary } from "./types";
import { COPY } from "@/lib/tree/content.generated";

/**
 * The payoff.
 *
 * Everything left on the tree since the last milestone comes back at once,
 * scattered across the screen. Deterministic scatter from the post index, so
 * it does not reshuffle on re-render and a reload shows the same picture.
 */
function scatter(idx: number, i: number, total: number) {
  const h = (Math.sin(idx * 12.9898 + i * 78.233) * 43758.5453) % 1;
  const j = Math.abs(h);
  const col = i % 4;
  const rowsNeeded = Math.ceil(total / 4);
  const row = Math.floor(i / 4);
  return {
    left: `${6 + col * 23 + (j - 0.5) * 7}%`,
    top: `${8 + (row / Math.max(rowsNeeded, 1)) * 74 + (j - 0.5) * 5}%`,
    rotate: `${(j - 0.5) * 16}deg`,
    delay: `${i * 55}ms`,
  };
}

export function MilestoneReel({
  milestone,
  phase,
  posts,
}: {
  milestone: number;
  phase: Phase;
  posts: PostSummary[];
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="relative h-dvh w-full overflow-hidden"
      style={{ background: `linear-gradient(${phase.skyTop}, ${phase.skyBottom})` }}
    >
      {posts.map((p, i) => {
        const s = scatter(p.idx, i, posts.length);
        return (
          <figure
            key={p.id}
            className="absolute w-[21%] max-w-[150px] rounded bg-white p-1.5 shadow-lg transition-all duration-700 ease-out"
            style={{
              left: s.left,
              top: s.top,
              transform: `rotate(${s.rotate}) scale(${shown ? 1 : 0.4})`,
              opacity: shown ? 1 : 0,
              transitionDelay: s.delay,
            }}
          >
            {p.image_url ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-sm">
                <Image src={p.image_url} alt={p.body ?? ""} fill className="object-cover" sizes="150px" />
              </div>
            ) : (
              <p className="line-clamp-4 px-1 py-2 text-[0.6875rem] leading-snug text-neutral-800">
                {p.body}
              </p>
            )}
          </figure>
        );
      })}

      <div className="pointer-events-none absolute inset-0 grid place-items-center px-6">
        <div
          className="pointer-events-auto rounded-xl bg-black/55 px-7 py-6 text-center backdrop-blur-sm transition-opacity duration-700"
          style={{ opacity: shown ? 1 : 0, transitionDelay: "420ms" }}
        >
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.2em] text-white/70">
            {COPY.milestoneHeading}
          </p>
          <p className="mt-2 text-4xl text-white">{milestone} posts</p>
          <p className="mx-auto mt-3 max-w-xs text-[1rem] leading-relaxed text-white/90">
            {COPY.milestoneMessage.replace("{count}", String(posts.length))}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 font-label text-[0.75rem] uppercase tracking-[0.14em] text-neutral-900"
          >
            {COPY.milestoneButton}
          </Link>
        </div>
      </div>
    </main>
  );
}
