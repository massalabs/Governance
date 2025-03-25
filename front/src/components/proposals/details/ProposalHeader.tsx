import { ChatBubbleLeftRightIcon, UserIcon } from "@heroicons/react/24/outline";
import { truncateAddress } from "../../../utils/address";
import { FormattedProposal } from "@/types/governance";

interface ProposalHeaderProps {
  proposal: FormattedProposal;
}

export function ProposalHeader({ proposal }: ProposalHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-f-tertiary dark:text-darkMuted">
          <span className="px-2 py-1 rounded-full bg-secondary/20 dark:bg-darkCard/20 text-brand dark:text-darkAccent">
            {proposal.status}
          </span>
          <span>•</span>
          <span>
            Created{" "}
            {new Date(Number(proposal.creationTimestamp)).toLocaleDateString()}
          </span>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-f-primary dark:text-darkText">
        {proposal.title}
      </h1>
      <div className="flex items-center gap-4 text-sm text-f-tertiary dark:text-darkMuted">
        <div className="flex items-center gap-1.5">
          <UserIcon className="h-4 w-4" />
          <span>{truncateAddress(proposal.owner)}</span>
        </div>
        {proposal.forumPostLink && (
          <a
            href={proposal.forumPostLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-brand dark:text-darkAccent hover:opacity-80 transition-opacity"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Forum Discussion</span>
          </a>
        )}
      </div>
    </div>
  );
}
