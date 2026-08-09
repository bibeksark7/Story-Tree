"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Tree } from "./Tree";
import { Composer } from "./Composer";
import { GroundBack, GroundFront, Sign } from "./Ground";
import { Favourites } from "./Favourites";
import { Calendar } from "./Calendar";
import { CursorLeaves } from "./CursorLeaves";
import {
  useSkin,
  useFavourites,
  setSkin,
  setFavourites,
  toggleFavourite,
  type Favourite,
} from "@/lib/tree/local";
import type { PostSummary } from "./types";
import { paletteFor } from "@/lib/tree/palette";
import { MILESTONE_EVERY, phaseOf, branchY, treeHeight } from "@/lib/tree/geometry";
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
  const [favOpen, setFavOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Per-visitor state lives in the browser — there are no accounts.
  const skin = useSkin();
  const favourites = useFavourites();

  function unlock() {
    setSkin("reve");
    setUnlocked(true);
    setTimeout(() => setUnlocked(false), 3600);
  }

  function isFavourite(p: PostSummary) {
    return favourites.some((f) => f.id === p.id);
  }

  function star(p: PostSummary) {
    const next = toggleFavourite(favourites, {
      id: p.id,
      idx: p.idx,
      label: (p.body ?? "A photo").slice(0, 60),
    });
    setFavourites(next);
  }

  /** Scroll the tree so a saved branch is centred, then open it. */
  function jumpTo(fav: Favourite) {
    const el = scroller.current;
    const post = posts.find((p) => p.id === fav.id);
    if (el) {
      // Canvas units map to pixels by the rendered/viewBox height ratio.
      const scale = el.scrollHeight / treeHeight(count);
      const y = branchY(fav.idx, count) * scale - el.clientHeight / 2;
      // Deliberately not `behavior: "smooth"`: it is a no-op in this scroll
      // container, and a jump that silently does nothing is worse than one
      // without an animation.
      el.scrollTo({ top: Math.max(y, 0) });
    }
    setFavOpen(false);
    if (post) setOpen(post);
  }

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
    scroller.current?.scrollTo({ top: 0 });
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
        {/* The ground spans the viewport; the tree canvas is a fixed width and
            renders centred, so drawing the field inside it left an island. */}
        <div className="relative w-full">
          <GroundBack phase={phase} />
          <div className="relative z-10">
            <Tree
              count={count}
              posts={posts}
              phase={phase}
              phaseIndex={phaseIndex}
              onOpen={setOpen}
              highlightIdx={justAdded}
              skin={skin}
            />
          </div>
          <GroundFront phase={phase} />
          <Sign phase={phase} />
        </div>
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

      <button
        type="button"
        onClick={() => setCalOpen(true)}
        aria-label="Open the climbing calendar"
        className="absolute right-3 top-9 z-30 rounded-md px-2 py-1.5 text-sm shadow-md"
        style={{ background: "rgba(255,255,255,0.94)", color: phase.ink }}
      >
        ▦
      </button>

      {calOpen && <Calendar phase={phase} onClose={() => setCalOpen(false)} />}

      <CursorLeaves />

      <Favourites
        favourites={favourites}
        open={favOpen}
        onToggleOpen={() => setFavOpen((v) => !v)}
        onJump={jumpTo}
        onRemove={(f) => {
          setFavourites(favourites.filter((x) => x.id !== f.id));
        }}
        phase={phase}
      />

      {unlocked && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-40 flex justify-center">
          <p className="rounded-full bg-black/70 px-4 py-2 font-label text-[0.6875rem] uppercase tracking-[0.16em] text-amber-200">
            New climber unlocked
          </p>
        </div>
      )}

      <Composer
        onUnlock={unlock}
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
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
        >
          <div
            className="w-full max-w-sm cursor-default rounded-lg bg-white p-5 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-label text-[0.6875rem] uppercase tracking-[0.16em] text-neutral-500">
                Branch {open.idx}
              </p>
              <button
                type="button"
                onClick={() => star(open)}
                aria-pressed={isFavourite(open)}
                aria-label={isFavourite(open) ? "Remove from saved branches" : "Save this branch"}
                className={`rounded-full px-2 py-1 text-lg leading-none ${
                  isFavourite(open) ? "text-amber-500" : "text-neutral-300 hover:text-neutral-500"
                }`}
              >
                ★
              </button>
            </div>
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
