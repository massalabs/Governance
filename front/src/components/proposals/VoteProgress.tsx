import { FormattedProposal } from "../../types/governance";
import { useMasogTotalSupply } from "../../hooks/useMasogData";

interface VoteProgressProps {
  proposal: FormattedProposal;
}

export function VoteProgress({ proposal }: VoteProgressProps) {
  const { data: totalSupply } = useMasogTotalSupply();

  if (!totalSupply) return null;

  // Add 1 to ensure it's more than 50%
  const requiredScore = totalSupply / 2n + 1n;
  const currentScore = proposal.positiveVoteVolume;

  // Convert to number with proper scaling to avoid integer division truncation
  const progressPercentage =
    Number((currentScore * 10000n) / requiredScore) / 100;
  const cappedProgress = Math.min(100, progressPercentage);

  const getProgressColor = () => {
    if (progressPercentage >= 100) return "bg-s-success";
    if (progressPercentage >= 75) return "bg-yellow-500";
    return "bg-brand";
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-f-primary">Progress to Acceptance</span>
        <span className="text-f-primary">{progressPercentage.toFixed(2)}%</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-300`}
          style={{ width: `${cappedProgress}%` }}
        />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-f-tertiary">
            {currentScore.toString()} voting power
          </span>
          <span className="text-f-tertiary">
            {requiredScore.toString()} required
          </span>
        </div>
        <div className="text-xs text-f-tertiary text-right">
          (more than 50% of total MASOG supply)
        </div>
      </div>
    </div>
  );
}
