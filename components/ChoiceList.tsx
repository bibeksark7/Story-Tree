import Link from "next/link";
import { GenerateChoice } from "./GenerateChoice";

/** Never written by the narrator. Deterministic, always correctly worded. */
export const CONTRIBUTE_LABEL = "Leave something here";

export type Choice = {
  label: string;
  slotIndex: number;
  /** The child that already exists in this slot, if any. */
  childId: string | null;
};

export type ChoiceListProps = {
  nodeId: string;
  choices: Choice[];
  /**
   * The contribute affordance is a third slot rendered by the application, not
   * by the narrator. Off until Phase 3 builds the page it links to.
   */
  showContribute?: boolean;
};

const base =
  "block w-full rounded-sm border px-5 py-4 text-left text-base transition-colors";

export function ChoiceList({ nodeId, choices, showContribute = false }: ChoiceListProps) {
  return (
    <nav className="flex flex-col gap-3">
      {choices.map((choice) =>
        choice.childId ? (
          <Link
            key={choice.slotIndex}
            href={`/n/${choice.childId}`}
            className={`${base} border-neutral-700 text-neutral-100 hover:border-neutral-400 hover:bg-neutral-900`}
          >
            {choice.label}
          </Link>
        ) : (
          <GenerateChoice
            key={choice.slotIndex}
            parentId={nodeId}
            slot={choice.slotIndex}
            label={choice.label}
            className={base}
          />
        ),
      )}

      {showContribute && (
        <Link
          href={`/n/${nodeId}/contribute`}
          className={`${base} border-amber-700/60 text-amber-200 hover:border-amber-500 hover:bg-amber-950/30`}
        >
          {CONTRIBUTE_LABEL}
        </Link>
      )}
    </nav>
  );
}
