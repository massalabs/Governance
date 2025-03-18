import { Link } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { truncateAddress } from "../../utils/address";
import { FormattedProposal, ProposalStatus } from "../../types/governance";

interface ProposalCardProps {
  proposal: FormattedProposal;
}

const statusConfigs: Record<
  ProposalStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    darkColor: string;
    darkBgColor: string;
  }
> = {
  DISCUSSION: {
    label: "Discussion",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    darkColor: "dark:text-indigo-400",
    darkBgColor: "dark:bg-indigo-400/10",
  },
  VOTING: {
    label: "Voting",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    darkColor: "dark:text-amber-400",
    darkBgColor: "dark:bg-amber-400/10",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    darkColor: "dark:text-emerald-400",
    darkBgColor: "dark:bg-emerald-400/10",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    darkColor: "dark:text-rose-400",
    darkBgColor: "dark:bg-rose-400/10",
  },
};

export function ProposalCard({ proposal }: ProposalCardProps) {
  const statusConfig = statusConfigs[proposal.status as ProposalStatus] || {
    label: proposal.status,
    color: "text-f-tertiary",
    bgColor: "bg-f-tertiary/10",
    darkColor: "dark:text-darkMuted",
    darkBgColor: "dark:bg-darkMuted/10",
  };

  return (
    <Link
      to={`/proposals/${proposal.id}`}
      className="bg-secondary dark:bg-darkCard border border-border dark:border-darkBorder p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      <div className="space-y-4">
        {/* Header with title and status */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-xl font-semibold text-f-primary dark:text-darkText group-hover:text-brand dark:group-hover:text-darkAccent mas-h2 line-clamp-1 flex-1">
            {proposal.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.darkBgColor} ${statusConfig.darkColor}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Summary */}
        <p className="text-f-tertiary dark:text-darkMuted mas-body2 line-clamp-2 leading-relaxed">
          {proposal.summary}
        </p>

        {/* Footer with metadata */}
        <div className="pt-2 border-t border-border dark:border-darkBorder">
          <div className="flex flex-wrap items-center gap-4 text-f-tertiary dark:text-darkMuted mas-caption">
            <div className="flex items-center gap-1.5">
              <UserIcon className="h-4 w-4" />
              <span>{truncateAddress(proposal.owner)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {new Date(
                  Number(proposal.creationTimestamp)
                ).toLocaleDateString()}
              </span>
            </div>
            {proposal.forumPostLink && (
              <a
                href={proposal.forumPostLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-brand dark:text-darkAccent hover:opacity-80 transition-opacity"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Forum Discussion</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
