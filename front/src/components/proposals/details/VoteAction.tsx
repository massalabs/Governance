import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { PixelButton } from "@/components/ui/PixelButton";
import { REQUIRED_MASOG } from "@/hooks/useCreateProposalMutation";

interface VoteActionProps {
  hasVoted: boolean;
  canVote: boolean;
  onVote: () => void;
}

export function VoteAction({ hasVoted, canVote, onVote }: VoteActionProps) {
  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <div className="flex flex-col items-center gap-4">
        {hasVoted ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircleIcon className="h-6 w-6" />
            <span className="font-medium text-lg">You've voted</span>
          </div>
        ) : !canVote ? (
          <div className="text-rose-400 font-medium text-lg">
            Minimum {REQUIRED_MASOG.toString()} MASOG required to vote
          </div>
        ) : (
          <PixelButton onClick={onVote} fullWidth variant="primary">
            Vote Now
          </PixelButton>
        )}
      </div>
    </div>
  );
}
