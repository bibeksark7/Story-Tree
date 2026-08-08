import Image from "next/image";

export type PassageProps = {
  prose: string;
  illustration: { src: string; alt: string };
  /** Short accession code derived from the node id. */
  accession: string;
  shelf: number;
  /** Set when this passage exists because someone left an object here. */
  objectName?: string | null;
};

export function Passage({ prose, illustration, accession, shelf, objectName }: PassageProps) {
  return (
    <article>
      {/* The plate: a sepia photograph mounted on the card. */}
      <div className="relative aspect-[8/5] w-full overflow-hidden border border-ink/25 bg-ink/10">
        <Image
          src={illustration.src}
          alt={illustration.alt}
          fill
          sizes="(max-width: 640px) 92vw, 512px"
          className="object-cover"
          priority
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-4 border-b border-paper-deep pb-2">
        <span className="label">
          {accession} · Shelf {shelf}
        </span>
        {objectName && (
          <span className="font-label text-[0.6875rem] uppercase tracking-[0.14em] text-stamp">
            left here: {objectName}
          </span>
        )}
      </div>

      <p className="ink-in mt-6 text-[1.1875rem] leading-[1.72] text-ink">{prose}</p>
    </article>
  );
}
