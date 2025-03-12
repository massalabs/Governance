import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface Proposal {
  id: bigint;
  title: string;
  summary: string;
  status: string;
  positiveVoteVolume: bigint;
  negativeVoteVolume: bigint;
  blankVoteVolume: bigint;
}

interface RecentProposalsSectionProps {
  loading: boolean;
  proposals: Proposal[];
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
        <div className="grid gap-4">
          {proposals.slice(0, 3).map((proposal) => (
            <Link
              key={proposal.id.toString()}
              to={`/proposals/${proposal.id}`}
              className="bg-secondary border border-border p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-f-primary group-hover:text-brand mas-h2">
                    {proposal.title}
                  </h3>
                  <p className="mt-2 text-sm text-f-tertiary mas-body2 line-clamp-2">
                    {proposal.summary}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    proposal.status === "votingStatus"
                      ? "bg-green-100 text-green-800"
                      : proposal.status === "executedStatus"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {proposal.status.replace("Status", "")}
                </span>
              </div>
              <div className="mt-4 flex gap-4 text-sm text-f-tertiary mas-body2">
                <span>Yes: {proposal.positiveVoteVolume.toString()}</span>
                <span>No: {proposal.negativeVoteVolume.toString()}</span>
                <span>Abstain: {proposal.blankVoteVolume.toString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
