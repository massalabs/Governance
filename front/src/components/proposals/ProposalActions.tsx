import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useUIStore } from "../../store/useUIStore";

interface ProposalActionsProps {
  status: string;
  proposalId: bigint;
  hasVoted: boolean;
  canVote: boolean;
}

export function ProposalActions({
  status,
  proposalId,
  hasVoted,
  canVote,
}: ProposalActionsProps) {
  const { openVoteModal } = useUIStore();
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus !== "VOTING") {
    return null;
  }

  if (hasVoted) {
    return (
      <div className="flex items-center gap-2 text-s-success">
        <CheckCircleIcon className="h-5 w-5" />
        <span className="mas-caption">Already Voted</span>
      </div>
    );
  }

  if (!canVote) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-s-error mas-caption">
          Minimum 1 MASOG required to vote
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => openVoteModal(proposalId)}
      className="px-4 py-2 bg-brand text-neutral rounded-lg hover:opacity-90 active-button mas-buttons"
    >
      Vote
    </button>
  );
}
