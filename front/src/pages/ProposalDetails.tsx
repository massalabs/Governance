import { useParams } from "react-router-dom";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ConnectButton } from "../components/connect-wallet-popup";
import { VoteProgress } from "../components/proposals/VoteProgress";
import { useGovernanceData } from "../hooks/useGovernanceData";
import { useMasogTotalSupply } from "../hooks/useMasogData";
import { truncateAddress } from "../utils/address";
import {
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  UserIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import VoteModal from "../components/VoteModal";
import { useUIStore } from "../store/useUIStore";
import { ParameterChanges } from "../components/proposals/ParameterChanges";

export default function ProposalDetails() {
  const { id } = useParams<{ id: string }>();
  const { connectedAccount } = useAccountStore();
  const { proposals, loading, userMasogBalance, userVotes } =
    useGovernanceData();
  const { data: totalSupply } = useMasogTotalSupply();
  const { openVoteModal } = useUIStore();

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

  if (loading || !totalSupply) {
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Bar with Back Button and Vote Button */}
      <div className="flex justify-between items-center">
        <Link
          to="/proposals"
          className="inline-flex items-center gap-2 text-f-tertiary hover:text-f-primary transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Proposals</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-f-tertiary">
            <span className="px-2 py-1 rounded-full bg-secondary text-brand">
              {proposal.status}
            </span>
            <span>•</span>
            <span>
              Created{" "}
              {new Date(
                Number(proposal.creationTimestamp)
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-f-primary">{proposal.title}</h1>
        <div className="flex items-center gap-4 text-sm text-f-tertiary">
          <div className="flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" />
            <span>{truncateAddress(proposal.owner)}</span>
          </div>
          {proposal.forumPostLink && (
            <a
              href={proposal.forumPostLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-brand hover:opacity-80 transition-opacity"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Forum Discussion</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Proposal Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-f-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Basic Information
            </h2>
            <div className="bg-secondary border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-f-primary mb-4">
                Summary
              </h3>
              <p className="text-f-tertiary whitespace-pre-wrap">
                {proposal.summary}
              </p>
            </div>
          </div>

          {/* Technical Details Section */}
          {proposal.parameterChange && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-f-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Technical Details
              </h2>
              <div className="bg-secondary border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-f-primary mb-4">
                  Parameter Changes
                </h3>
                <ParameterChanges parameterChange={proposal.parameterChange} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Voting Status */}
        <div className="space-y-6">
          {/* Vote Action */}
          {isVoting && (
            <div className="bg-secondary border border-border rounded-lg p-6">
              <div className="flex flex-col items-center gap-4">
                {hasVoted ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircleIcon className="h-6 w-6" />
                    <span className="font-medium text-lg">You've voted</span>
                  </div>
                ) : !canVote ? (
                  <div className="text-rose-400 font-medium text-lg">
                    Minimum 1 MASOG required to vote
                  </div>
                ) : (
                  <button
                    onClick={() => openVoteModal(proposal.id)}
                    className="group relative w-full px-6 py-3 bg-brand text-white rounded-lg font-medium text-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {/* Pixel grid background effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:4px_4px] animate-shimmer" />

                    {/* Main button content */}
                    <div className="relative flex items-center justify-center gap-2">
                      <span className="relative z-10">Vote Now</span>
                      {/* Pixel corner decorations */}
                      <div className="absolute top-0 left-0 w-2 h-2 bg-white/20" />
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/20" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/20" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/20" />
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Voting Status Card */}
          <div className="bg-secondary border border-border rounded-lg p-6">
            <VoteProgress proposal={proposal} />
          </div>

          {/* Voting Period */}
          <div className="bg-secondary border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-f-primary mb-4">
              Voting Period
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-f-tertiary">Start</span>
                <span className="text-f-primary">
                  {new Date(
                    Number(proposal.creationTimestamp)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-f-tertiary">End</span>
                <span className="text-f-primary">
                  {/* TODO: Add end date */}
                  {/* {new Date(Number()).toLocaleString()} */}
                </span>
              </div>
            </div>
          </div>

          {/* Quorum */}
          <div className="bg-secondary border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-f-primary mb-4">
              Quorum
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-f-tertiary">Required</span>
                <span className="text-f-primary">50% of total supply</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-f-tertiary">Current</span>
                <span className="text-f-primary">
                  {(
                    (Number(proposal.positiveVoteVolume) /
                      Number(totalSupply)) *
                    100
                  ).toFixed(4)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoteModal />
    </div>
  );
}
