import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { FormattedProposal } from "../../types/governance";
import { truncateAddress } from "../../utils/address";

interface ProposalInfoProps {
  proposal: FormattedProposal;
}

export function ProposalInfo({ proposal }: ProposalInfoProps) {
  const isValidForumLink = (link: string) => {
    return link.startsWith("https://forum.massa.community/");
  };

  const hasValidForumLink =
    !!proposal.forumPostLink &&
    typeof proposal.forumPostLink === "string" &&
    isValidForumLink(proposal.forumPostLink);

  return (
    <div className="flex items-center gap-4 text-f-tertiary mas-caption">
      <span>Created by: {truncateAddress(proposal.owner)}</span>
      <span>•</span>
      <span>
        {new Date(Number(proposal.creationTimestamp)).toLocaleDateString()}
      </span>
      {hasValidForumLink && (
        <>
          <span>•</span>
          <a
            href={proposal.forumPostLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand hover:opacity-80"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Forum Discussion</span>
          </a>
        </>
      )}
    </div>
  );
}
