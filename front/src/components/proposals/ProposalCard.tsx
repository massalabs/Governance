import { Link } from "react-router-dom";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { truncateAddress } from "../../utils/address";
import { FormattedProposal, ProposalStatus } from "../../types/governance";

interface ProposalCardProps {
  proposal: FormattedProposal;
}

const statusConfigs: Record<
  ProposalStatus,
  { label: string; color: string; bgColor: string }
> = {
  DISCUSSION: {
    label: "Discussion",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  VOTING: {
    label: "Voting",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
};

export function ProposalCard({ proposal }: ProposalCardProps) {
  const statusConfig = statusConfigs[proposal.status as ProposalStatus] || {
    label: proposal.status,
    color: "text-f-tertiary",
    bgColor: "bg-f-tertiary/10",
  };

  return (
    <Link
      to={`/proposals/${proposal.id}`}
      className="bg-secondary border border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-lg font-medium text-f-primary group-hover:text-brand mas-h2 line-clamp-1 flex-1">
          {proposal.title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-f-tertiary mas-body2 line-clamp-2">
        {proposal.summary}
      </p>
      <div className="mt-3 flex items-center gap-2 text-f-tertiary mas-caption">
        <span>Created by: {truncateAddress(proposal.owner)}</span>
        <span>•</span>
        <span>
          {new Date(Number(proposal.creationTimestamp)).toLocaleDateString()}
        </span>
      </div>
      {proposal.forumPostLink && (
        <a
          href={proposal.forumPostLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 inline-flex items-center gap-1 text-brand hover:opacity-80 text-sm"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          <span>Forum Discussion</span>
        </a>
      )}
    </Link>
  );
}
