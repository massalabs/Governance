import { useParams } from "react-router-dom";
import { VoteProgress } from "../components/proposals/VoteProgress";
import {
  useGovernanceData,
  useProposalVotes,
} from "../hooks/useGovernanceData";
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
import { FormattedProposal } from "@/types/governance";
import { REQUIRED_MASOG } from "@/hooks/useCreateProposal";
import { Loading } from "@/components/ui/Loading";
import { PixelButton } from "@/components/ui/PixelButton";

interface ProposalHeaderProps {
  proposal: FormattedProposal;
}

function ProposalHeader({ proposal }: ProposalHeaderProps) {
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

interface BasicInfoSectionProps {
  summary: string;
}

function BasicInfoSection({ summary }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
        Basic Information
      </h2>
      <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-f-primary dark:text-darkText mb-4">
          Summary
        </h3>
        <p className="text-f-tertiary dark:text-darkMuted whitespace-pre-wrap">
          {summary}
        </p>
      </div>
    </div>
  );
}

interface TechnicalDetailsSectionProps {
  parameterChange: string;
}

function TechnicalDetailsSection({
  parameterChange,
}: TechnicalDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
        Technical Details
      </h2>
      <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-f-primary dark:text-darkText mb-4">
          Parameter Changes
        </h3>
        <ParameterChanges parameterChange={parameterChange} />
      </div>
    </div>
  );
}

interface VoteActionProps {
  hasVoted: boolean;
  canVote: boolean;
  onVote: () => void;
}

function VoteAction({ hasVoted, canVote, onVote }: VoteActionProps) {
  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <div className="flex flex-col items-center gap-4">
        {hasVoted ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircleIcon className="h-6 w-6" />
            <span className="font-medium text-lg">You've voted</span>
          </div>
        ) : !canVote ? (
          <div className="text-rose-400 font-medium text-lg">
            Minimum {REQUIRED_MASOG.toString()} MASOG required to vote
          </div>
        ) : (
          <PixelButton onClick={onVote} fullWidth variant="primary">
            Vote Now
          </PixelButton>
        )}
      </div>
    </div>
  );
}

interface VotingPeriodProps {
  creationTimestamp: bigint;
}

function VotingPeriod({ creationTimestamp }: VotingPeriodProps) {
  const startDate = new Date(
    Number(creationTimestamp) * 1000 + 2 * 7 * 24 * 60 * 60 * 1000
  );
  const endDate = new Date(
    Number(creationTimestamp) * 1000 + 5 * 7 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-f-primary dark:text-darkText mb-4">
        Voting Period
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-f-tertiary dark:text-darkMuted">Start</span>
          <span className="text-f-primary dark:text-darkText">
            {startDate.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-f-tertiary dark:text-darkMuted">End</span>
          <span className="text-f-primary dark:text-darkText">
            {endDate.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

interface QuorumProps {
  positiveVoteVolume: bigint;
  totalSupply: bigint;
}

function Quorum({ positiveVoteVolume, totalSupply }: QuorumProps) {
  const currentPercentage =
    Number(totalSupply) > 0
      ? (Number(positiveVoteVolume) / Number(totalSupply)) * 100
      : 0;

  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-f-primary dark:text-darkText mb-4">
        Quorum
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-f-tertiary dark:text-darkMuted">Required</span>
          <span className="text-f-primary dark:text-darkText">
            50.0% of total supply
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-f-tertiary dark:text-darkMuted">Current</span>
          <span className="text-f-primary dark:text-darkText">
            {currentPercentage.toFixed(4)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProposalDetails() {
  const { id } = useParams<{ id: string }>();
  const { proposals, userMasogBalance, userVotes, proposalVotesMap, loading } =
    useGovernanceData();
  const { data: totalSupply, isLoading: isLoadingSupply } =
    useMasogTotalSupply();
  const { openVoteModal } = useUIStore();

  const proposal = proposals.find((p) => p.id.toString() === id);
  const proposalVotes = proposalVotesMap[id ?? ""] ?? [];

  if (!proposal) {
    return (
      <div className="text-center py-8 text-f-tertiary dark:text-darkMuted">
        Proposal not found
      </div>
    );
  }

  const isVoting = proposal.status === "VOTING";
  const hasVoted = !!userVotes[proposal.id.toString()];
  const canVote = (userMasogBalance ?? 0n) >= 1n;

  // Calculate vote counts from proposalVotes
  const voteCounts = {
    total: proposalVotes.length,
    positive: proposalVotes.filter((v) => v === 1n).length,
    negative: proposalVotes.filter((v) => v === -1n).length,
    blank: proposalVotes.filter((v) => v === 0n).length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Bar with Back Button */}
      <div className="flex justify-between items-center">
        <Link
          to="/proposals"
          className="inline-flex items-center gap-2 text-f-tertiary dark:text-darkMuted hover:text-f-primary dark:hover:text-darkText transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Proposals</span>
        </Link>
      </div>

      {/* Header Section */}
      <ProposalHeader proposal={proposal} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Proposal Content */}
        <div className="lg:col-span-2 space-y-8">
          <BasicInfoSection summary={proposal.summary} />
          {proposal.parameterChange && (
            <TechnicalDetailsSection
              parameterChange={proposal.parameterChange}
            />
          )}
        </div>

        {/* Right Column - Voting Status */}
        <div className="space-y-6">
          {isVoting && (
            <VoteAction
              hasVoted={hasVoted}
              canVote={canVote}
              onVote={() => openVoteModal(proposal.id)}
            />
          )}

          <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
            {loading ? (
              <Loading text="Loading vote data..." size="sm" />
            ) : (
              <VoteProgress
                proposal={{
                  ...proposal,
                  positiveVoteVolume: BigInt(voteCounts.positive),
                  negativeVoteVolume: BigInt(voteCounts.negative),
                  blankVoteVolume: BigInt(voteCounts.blank),
                }}
              />
            )}
          </div>

          <VotingPeriod creationTimestamp={proposal.creationTimestamp} />
          {isLoadingSupply || !totalSupply ? (
            <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
              <Loading text="Loading quorum data..." size="sm" />
            </div>
          ) : (
            <Quorum
              positiveVoteVolume={proposal.positiveVoteVolume}
              totalSupply={totalSupply}
            />
          )}
        </div>
      </div>

      <VoteModal />
    </div>
  );
}
