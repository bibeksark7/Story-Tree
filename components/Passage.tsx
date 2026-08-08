import Image from "next/image";

export type PassageProps = {
  prose: string;
  illustration: { src: string; alt: string };
};

export function Passage({ prose, illustration }: PassageProps) {
  return (
    <article className="flex flex-col gap-8">
      <div className="relative aspect-[8/5] w-full overflow-hidden rounded-sm bg-neutral-900">
        <Image
          src={illustration.src}
          alt={illustration.alt}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
          priority
        />
      </div>
      <p className="text-lg leading-relaxed text-neutral-200">{prose}</p>
    </article>
  );
}
