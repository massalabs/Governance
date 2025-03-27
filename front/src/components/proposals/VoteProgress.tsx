import { FormattedProposal } from "../../types/governance";
import { useMasogTotalSupply } from "../../hooks/useMasogData";

interface VoteProgressProps {
  proposal: FormattedProposal;
}

interface VoteBarProps {
  label: string;
  percentage: number;
  votes: bigint;
  color: {
    text: string;
    border: string;
    background: string;
  };
}

const VOTE_COLORS = {
  yes: {
    text: "text-emerald-400",
    border: "border-emerald-400/30",
    background: "rgba(16, 185, 129, 0.2)",
  },
  no: {
    text: "text-rose-400",
    border: "border-rose-400/30",
    background: "rgba(244, 63, 94, 0.2)",
  },
  abstain: {
    text: "text-indigo-400",
    border: "border-indigo-400/30",
    background: "rgba(99, 102, 241, 0.2)",
  },
} as const;

function VoteBar({ label, percentage, votes, color }: VoteBarProps) {
  const formatPercentage = (value: number) => {
    if (value === 0) return "0";
    if (value < 0.001) return "<0.001";
    return value.toFixed(3);
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={`${color.text} font-medium`}>{label}</span>
        <span className="text-f-primary dark:text-darkText">
          {formatPercentage(percentage)}%
        </span>
      </div>
      <div
        className={`h-8 bg-secondary/20 dark:bg-darkCard/20 rounded-md overflow-hidden relative ${color.border}`}
      >
        {/* Background bar */}
        <div
          className="h-full transition-all duration-300 absolute inset-0"
          style={{
            width: "100%",
            backgroundColor: percentage > 0 ? color.background : "transparent",
            clipPath: `inset(0 ${100 - percentage}% 0 0)`,
          }}
        />
        {/* MASOG amount text */}
        {votes > 0n && (
          <div className="h-full flex items-center px-4">
            <span
              className={`text-sm font-medium ${color.text} whitespace-nowrap`}
            >
              {Number(votes).toLocaleString()} MASOG
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function AcceptanceThreshold({
  thresholdPercentage,
  currentProgress,
}: {
  thresholdPercentage: number;
  currentProgress: number;
}) {
  const formatProgress = (value: number) => {
    if (isNaN(value) || value === 0) return "0.0000";
    if (value < 0.001) return "<0.001";
    return value.toFixed(4);
  };

  return (
    <div className="pt-4 border-t border-border/50 dark:border-darkAccent/50">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-4 w-0.5 bg-amber-400/50" />
        <span className="text-sm text-amber-400 font-medium">
          Acceptance Threshold
        </span>
      </div>
      <div className="space-y-1">
        <div className="text-xs text-f-tertiary dark:text-darkMuted pl-2">
          Required: {thresholdPercentage.toFixed(1)}% of masog total supply
        </div>
        <div className="text-xs text-emerald-400 pl-2">
          Current: {currentProgress > 0 ? formatProgress(currentProgress) : "0"}
          % of masog total supply
        </div>
      </div>
    </div>
  );
}

export function VoteProgress({ proposal }: VoteProgressProps) {
  const { data: totalSupply } = useMasogTotalSupply();

  if (!totalSupply) return null;

  // Calculate required score (50% of total masog supply)
  const requiredScore = totalSupply / 2n + 1n;

  // Calculate total votes
  const totalVotes =
    proposal.positiveVoteVolume +
    proposal.negativeVoteVolume +
    proposal.blankVoteVolume;

  // Calculate abstain votes (total supply - total votes)
  const abstainVotes = totalSupply - totalVotes;

  // Calculate percentages relative to total supply with proper decimal handling
  const calculateSupplyPercentage = (votes: bigint) => {
    if (votes === 0n) return 0;
    const percentage = (Number(votes) / Number(totalSupply)) * 100;
    return percentage;
  };

  const yesPercentage = calculateSupplyPercentage(proposal.positiveVoteVolume);
  const noPercentage = calculateSupplyPercentage(proposal.negativeVoteVolume);
  const blankPercentage = calculateSupplyPercentage(proposal.blankVoteVolume);
  const abstainPercentage = calculateSupplyPercentage(abstainVotes);

  // Calculate threshold percentage based on total supply
  const thresholdPercentage = Number((requiredScore * 100n) / totalSupply);

  // Calculate current progress towards threshold
  const currentProgress =
    Number(totalSupply) > 0
      ? (Number(proposal.positiveVoteVolume) / Number(totalSupply)) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-f-primary dark:text-darkText">
          Vote Distribution
        </h3>
      </div>

      <div className="text-sm text-f-tertiary dark:text-darkMuted">
        Total supply: {Number(totalSupply).toLocaleString()} MASOG
      </div>
      {/* Vote Bars */}
      <div className="space-y-4">
        <VoteBar
          label="Yes"
          percentage={yesPercentage}
          votes={proposal.positiveVoteVolume}
          color={VOTE_COLORS.yes}
        />
        <VoteBar
          label="No"
          percentage={noPercentage}
          votes={proposal.negativeVoteVolume}
          color={VOTE_COLORS.no}
        />
        <VoteBar
          label="Blank"
          percentage={blankPercentage}
          votes={proposal.blankVoteVolume}
          color={VOTE_COLORS.abstain}
        />
        <VoteBar
          label="Abstain"
          percentage={abstainPercentage}
          votes={abstainVotes}
          color={VOTE_COLORS.abstain}
        />
      </div>

      {/* Acceptance Threshold */}
      <AcceptanceThreshold
        thresholdPercentage={thresholdPercentage}
        currentProgress={currentProgress}
      />
    </div>
  );
}
