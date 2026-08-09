"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Tree } from "./Tree";
import { Composer } from "./Composer";
import type { PostSummary } from "./types";
import { paletteFor } from "@/lib/tree/palette";
import { MILESTONE_EVERY, phaseOf } from "@/lib/tree/geometry";
import { COPY, ART } from "@/lib/tree/content.generated";

export function TreeView({
  initialCount,
  initialPosts,
}: {
  initialCount: number;
  initialPosts: PostSummary[];
}) {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(initialCount);
  const [posts, setPosts] = useState(initialPosts);
  const [open, setOpen] = useState<PostSummary | null>(null);
  const [justAdded, setJustAdded] = useState<number | undefined>();

  const phaseIndex = phaseOf(count);
  const phase = paletteFor(phaseIndex);
  const phaseName = COPY.phaseNames[phaseIndex % COPY.phaseNames.length];
  const toMilestone = MILESTONE_EVERY - (count % MILESTONE_EVERY);

  // Start at the top: the climber is the point, and history is below him.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, []);

  async function refresh(newIdx: number) {
    const res = await fetch("/api/tree", { cache: "no-store" });
    const data = await res.json();
    setCount(data.count);
    setPosts(data.posts);
    setJustAdded(newIdx);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-cover bg-center"
      style={
        // The sky sits behind the scroll container rather than inside the SVG,
        // so it stays put while the tree scrolls past — parallax, and no
        // stretching a wide image over a canvas thousands of pixels tall.
        ART.sky[phaseIndex % 4]
          ? {
              backgroundImage: `linear-gradient(to bottom, transparent 55%, ${phase.skyBottom}), url(/tree/sky-${phaseIndex % 4}.png)`,
            }
          : { background: `linear-gradient(${phase.skyTop}, ${phase.skyBottom})` }
      }
    >
      <div ref={scroller} className="h-full w-full overflow-y-auto overscroll-contain">
        <Tree
          count={count}
          posts={posts}
          phase={phase}
          phaseIndex={phaseIndex}
          onOpen={setOpen}
          highlightIdx={justAdded}
        />
      </div>

      {/* Progress, pinned. The one number that explains the whole product. */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 flex items-baseline justify-between px-4 py-3"
        style={{ color: phase.ink }}
      >
        <span className="font-label text-[0.6875rem] uppercase tracking-[0.16em] opacity-80">
          {count} {count === 1 ? "post" : "posts"} · {phaseName}
        </span>
        <span className="font-label text-[0.6875rem] uppercase tracking-[0.16em] opacity-60">
          {toMilestone} to the next milestone
        </span>
      </div>

      <Composer
        onPosted={(idx, milestone) => {
          if (milestone) router.push(`/milestone/${milestone}`);
          else refresh(idx);
        }}
        ink={phase.ink}
      />

      {open && (
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(null)}
          className="absolute inset-0 z-20 flex items-end justify-center bg-black/45 p-4 sm:items-center"
        >
          <div
            className="w-full max-w-sm cursor-default rounded-lg bg-white p-5 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-label text-[0.6875rem] uppercase tracking-[0.16em] text-neutral-500">
              Branch {open.idx}
            </p>
            {open.image_url && (
              <div className="relative mt-3 aspect-square w-full overflow-hidden rounded">
                <Image src={open.image_url} alt={open.body ?? "A posted photo"} fill className="object-cover" sizes="384px" />
              </div>
            )}
            {open.body && <p className="mt-3 text-[1.0625rem] leading-relaxed text-neutral-900">{open.body}</p>}
          </div>
        </button>
      )}
    </div>
  );
}
