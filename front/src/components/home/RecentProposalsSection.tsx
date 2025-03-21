import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { FormattedProposal } from "../../types/governance";
import { ProposalCard } from "../proposals/ProposalCard";

interface RecentProposalsSectionProps {
  loading: boolean;
  proposals: FormattedProposal[];
}

export function RecentProposalsSection({
  loading,
  proposals,
}: RecentProposalsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-f-primary mas-subtitle">
          Recent Proposals
        </h2>
        <Link
          to="/proposals"
          className="text-brand hover:text-brand/80 flex items-center gap-2 mas-buttons"
        >
          View all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-f-tertiary">
          Loading proposals...
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-8 text-f-tertiary">
          No proposals found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proposals.slice(0, 3).map((proposal) => (
            <ProposalCard key={proposal.id.toString()} proposal={proposal} />
          ))}
        </div>
      )}
    </section>
  );
}
