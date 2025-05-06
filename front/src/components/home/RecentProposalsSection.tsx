import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { FormattedProposal } from "../../types/governance";
import { ProposalCard } from "../proposals/ProposalCard";
import { ProposalStatus } from "../../config";

interface RecentProposalsSectionProps {
  proposals: FormattedProposal[];
}

export function RecentProposalsSection({
  proposals,
}: RecentProposalsSectionProps) {
  // Filter and sort active proposals, prioritizing voting status
  const activeProposals = proposals
    .filter(
      (p) =>
        p.status === ProposalStatus.DISCUSSION ||
        p.status === ProposalStatus.VOTING
    )
    .sort((a, b) => {
      // Put voting proposals first
      if (a.status === ProposalStatus.VOTING && b.status !== ProposalStatus.VOTING) return -1;
      if (a.status !== ProposalStatus.VOTING && b.status === ProposalStatus.VOTING) return 1;
      // Then sort by creation timestamp (newest first)
      return Number(b.creationTimestamp) - Number(a.creationTimestamp);
    });

  return (
    <section className="space-y-8">
      {activeProposals.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-f-primary mas-subtitle">
              Active Proposals
            </h2>
            <Link
              to="/proposals"
              className="text-brand hover:text-brand/80 flex items-center gap-2 mas-buttons"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id.toString()}
                proposal={proposal}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
