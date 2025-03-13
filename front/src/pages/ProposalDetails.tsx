import { useParams } from "react-router-dom";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ConnectButton } from "../components/connect-wallet-popup";
import { VoteDistribution } from "../components/proposals/VoteDistribution";
import { VoteProgress } from "../components/proposals/VoteProgress";
import { ProposalActions } from "../components/proposals/ProposalActions";
import { useGovernanceData } from "../hooks/useGovernanceData";
import { truncateAddress } from "../utils/address";
import {
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function ProposalDetails() {
  const { id } = useParams();
  const { connectedAccount } = useAccountStore();
  const { proposals, loading, userMasogBalance, userVotes } =
    useGovernanceData();

  const proposal = proposals.find((p) => p.id.toString() === id);

  if (!connectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <h1 className="text-2xl font-bold text-f-primary mas-title">
          Connect to View Proposal
        </h1>
        <p className="text-f-tertiary mas-body text-center max-w-md">
          Connect your wallet to view proposal details
        </p>
        <ConnectButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-f-tertiary">
        Loading proposal...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-8 text-f-tertiary">Proposal not found</div>
    );
  }

  const isVoting = proposal.status === "VOTING";
  const hasVoted = !!userVotes[proposal.id.toString()];
  const canVote = (userMasogBalance ?? 0n) >= 1n;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/proposals"
        className="inline-flex items-center text-brand hover:opacity-80 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Proposals
      </Link>

      <div className="bg-secondary border border-border rounded-lg p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-f-primary mas-title">
              {proposal.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposal.status === "VOTING"
                  ? "bg-brand/10 text-brand"
                  : proposal.status === "EXECUTED"
                  ? "bg-s-success/10 text-s-success"
                  : "bg-f-tertiary/10 text-f-tertiary"
              }`}
            >
              {proposal.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-f-tertiary mas-caption">
            <span>Created by: {truncateAddress(proposal.owner)}</span>
            <span>•</span>
            <span>
              {new Date(
                Number(proposal.creationTimestamp)
              ).toLocaleDateString()}
            </span>
            {proposal.forumPostLink && (
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
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-f-primary mas-h2">
            Description
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-f-tertiary mas-body whitespace-pre-wrap">
              {proposal.summary}
            </p>
          </div>
        </div>

        {/* Voting Progress */}
        {isVoting && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-f-primary mas-h2">
              Voting Progress
            </h2>
            <VoteProgress proposal={proposal} />
          </div>
        )}

        {/* Vote Distribution */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-f-primary mas-h2">
            Vote Distribution
          </h2>
          <VoteDistribution proposal={proposal} />
        </div>

        {/* Actions */}
        {isVoting && (
          <div className="flex justify-end pt-4 border-t border-border">
            <ProposalActions
              status={proposal.status}
              proposalId={proposal.id}
              hasVoted={hasVoted}
              canVote={canVote}
            />
          </div>
        )}
      </div>
    </div>
  );
}
