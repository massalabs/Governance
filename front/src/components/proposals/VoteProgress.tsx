import { FormattedProposal } from "../../types/governance";
import { useMasogTotalSupply } from "../../hooks/useMasogData";

interface VoteProgressProps {
  proposal: FormattedProposal;
}

export function VoteProgress({ proposal }: VoteProgressProps) {
  const { data: totalSupply } = useMasogTotalSupply();

  if (!totalSupply) return null;

  // Debug logs
  console.log("Total Supply:", totalSupply.toString());
  console.log("Positive Votes:", proposal.positiveVoteVolume.toString());
  console.log("Negative Votes:", proposal.negativeVoteVolume.toString());
  console.log("Blank Votes:", proposal.blankVoteVolume.toString());

  // Calculate required score (50% of total supply)
  const requiredScore = totalSupply / 2n + 1n;

  // Calculate total votes
  const totalVotes =
    proposal.positiveVoteVolume +
    proposal.negativeVoteVolume +
    proposal.blankVoteVolume;

  // Calculate percentages with proper BigInt handling
  const yesPercentage =
    totalVotes > 0n
      ? Number((proposal.positiveVoteVolume * 100n) / totalVotes)
      : 0;
  const noPercentage =
    totalVotes > 0n
      ? Number((proposal.negativeVoteVolume * 100n) / totalVotes)
      : 0;
  const blankPercentage =
    totalVotes > 0n
      ? Number((proposal.blankVoteVolume * 100n) / totalVotes)
      : 0;

  // Calculate threshold percentage based on total supply
  const thresholdPercentage = Number((requiredScore * 100n) / totalSupply);

  // Calculate current progress towards threshold
  const positiveVotesNum = Number(proposal.positiveVoteVolume);
  const totalSupplyNum = Number(totalSupply);
  const currentProgress =
    totalSupplyNum > 0 ? (positiveVotesNum / totalSupplyNum) * 100 : 0;
  console.log(currentProgress);
  // Format the current progress with proper handling of small numbers
  const formatProgress = (value: number) => {
    console.log(value);
    console.log(value.toFixed(4));
    console.log(isNaN(value));
    if (isNaN(value) || value === 0) return "0.0000";
    return value.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-f-primary">
          Vote Distribution
        </h3>
        <div className="text-sm text-f-tertiary">
          {totalVotes.toString()} total votes
        </div>
      </div>

      {/* Vote Bars */}
      <div className="space-y-4">
        {/* Yes Votes */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-emerald-400 font-medium">Yes</span>
            <span className="text-f-primary">{yesPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-8 bg-secondary/50 rounded-md overflow-hidden relative border border-emerald-400/30">
            <div
              className="h-full bg-emerald-400/20 transition-all duration-300 flex items-center px-4"
              style={{ width: `${yesPercentage}%` }}
            >
              <span className="text-sm font-medium text-emerald-400">
                {proposal.positiveVoteVolume.toString()}
              </span>
            </div>
          </div>
        </div>

        {/* No Votes */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-rose-400 font-medium">No</span>
            <span className="text-f-primary">{noPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-8 bg-secondary/50 rounded-md overflow-hidden relative border border-rose-400/30">
            <div
              className="h-full bg-rose-400/20 transition-all duration-300 flex items-center px-4"
              style={{ width: `${noPercentage}%` }}
            >
              <span className="text-sm font-medium text-rose-400">
                {proposal.negativeVoteVolume.toString()}
              </span>
            </div>
          </div>
        </div>

        {/* Blank Votes */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-indigo-400 font-medium">Abstain</span>
            <span className="text-f-primary">
              {blankPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-8 bg-secondary/50 rounded-md overflow-hidden relative border border-indigo-400/30">
            <div
              className="h-full bg-indigo-400/20 transition-all duration-300 flex items-center px-4"
              style={{ width: `${blankPercentage}%` }}
            >
              <span className="text-sm font-medium text-indigo-400">
                {proposal.blankVoteVolume.toString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Threshold */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-0.5 bg-amber-400/50" />
          <span className="text-sm text-amber-400 font-medium">
            Acceptance Threshold
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-f-tertiary pl-2">
            Required: {thresholdPercentage.toFixed(1)}% of total supply
          </div>
          <div className="text-xs text-emerald-400 pl-2">
            Current: {formatProgress(currentProgress)} % of total supply
          </div>
        </div>
      </div>
    </div>
  );
}
