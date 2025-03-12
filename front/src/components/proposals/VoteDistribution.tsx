import { FormattedProposal } from "../../types/governance";

interface VoteDistributionProps {
  proposal: FormattedProposal;
}

export function VoteDistribution({ proposal }: VoteDistributionProps) {
  const calculatePercentage = (value: bigint) => {
    const total =
      proposal.positiveVoteVolume +
      proposal.negativeVoteVolume +
      proposal.blankVoteVolume;
    if (total === 0n) return 0;
    return (Number(value) / Number(total)) * 100;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-f-primary mas-h3">Vote Distribution</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-f-tertiary mas-body2">Yes</span>
          <span className="text-f-primary mas-body2">
            {proposal.positiveVoteVolume.toString()}
          </span>
        </div>
        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-s-success"
            style={{
              width: `${calculatePercentage(proposal.positiveVoteVolume)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-f-tertiary mas-body2">No</span>
          <span className="text-f-primary mas-body2">
            {proposal.negativeVoteVolume.toString()}
          </span>
        </div>
        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-s-error"
            style={{
              width: `${calculatePercentage(proposal.negativeVoteVolume)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-f-tertiary mas-body2">Abstain</span>
          <span className="text-f-primary mas-body2">
            {proposal.blankVoteVolume.toString()}
          </span>
        </div>
        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-f-tertiary"
            style={{
              width: `${calculatePercentage(proposal.blankVoteVolume)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
