import { FormattedProposal } from "../../types/governance";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalInfo } from "./ProposalInfo";
import { VoteDistribution } from "./VoteDistribution";
import { ProposalActions } from "./ProposalActions";

interface ProposalCardProps {
  proposal: FormattedProposal;
  userMasogBalance: bigint;
  hasVoted: boolean;
}

export function ProposalCard({
  proposal,
  userMasogBalance,
  hasVoted,
}: ProposalCardProps) {
  return (
    <div className="bg-secondary border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 space-y-4">
        <ProposalHeader proposal={proposal} />
        <ProposalInfo proposal={proposal} />

        <div className="space-y-4 pt-4 border-t border-border">
          <VoteDistribution proposal={proposal} />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <ProposalActions
            status={proposal.status}
            proposalId={proposal.id}
            hasVoted={hasVoted}
            canVote={
              proposal.status.toUpperCase() === "VOTING" &&
              userMasogBalance >= 1n
            }
          />
        </div>
      </div>
    </div>
  );
}
