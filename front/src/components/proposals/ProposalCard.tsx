import { Link } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { truncateAddress } from "../../utils/address";
import { FormattedProposal } from "../../types/governance";
import { getStatusConfig, getDisplayStatus } from "../../utils/proposalStatus";

interface ProposalCardProps {
  proposal: FormattedProposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const statusConfig = getStatusConfig(proposal.status);
  const displayStatus = getDisplayStatus(proposal);

  return (
    <div className="bg-secondary dark:bg-darkCard border border-border dark:border-darkBorder p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group">
      <Link to={`/proposals/${proposal.id}`} className="block space-y-4">
        {/* Header with title and status */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-xl font-semibold text-f-primary dark:text-darkText group-hover:text-brand dark:group-hover:text-darkAccent mas-h2 line-clamp-1 flex-1">
            {proposal.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.darkBgColor} ${statusConfig.darkColor}`}
          >
            {displayStatus}
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
          </div>
        </div>
      </Link>
      {proposal.forumPostLink && (
        <div className="mt-4">
          <a
            href={proposal.forumPostLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-brand dark:text-darkAccent hover:opacity-80 transition-opacity"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Forum Discussion</span>
          </a>
        </div>
      )}
    </div>
  );
}
