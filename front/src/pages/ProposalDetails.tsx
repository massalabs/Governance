import { useParams } from "react-router-dom";
import { VoteProgress } from "../components/proposals/VoteProgress";
import { useGovernanceData } from "../hooks/useGovernanceData";
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
import { useAccountStore } from "@massalabs/react-ui-kit";
import { useWriteSmartContract } from "@massalabs/react-ui-kit";
import { useContractStore } from "../store/useContractStore";
import { Args } from "@massalabs/massa-web3";

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
  status: string;
}

function VotingPeriod({ creationTimestamp, status }: VotingPeriodProps) {
  const DISCUSSION_PERIOD = 3 * 7 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds
  const VOTING_PERIOD = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks in milliseconds

  const startDate = new Date(Number(creationTimestamp) + DISCUSSION_PERIOD);
  const endDate = new Date(
    Number(creationTimestamp) + DISCUSSION_PERIOD + VOTING_PERIOD
  );

  const isVotingEnded = status === "ACCEPTED" || status === "REJECTED";
  const currentTime = new Date().getTime();
  const votingEndTime =
    Number(creationTimestamp) + DISCUSSION_PERIOD + VOTING_PERIOD;
  const isTimeExpired = currentTime > votingEndTime;

  if (isVotingEnded || (status === "VOTING" && isTimeExpired)) {
    return (
      <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
        <div className="flex items-center justify-center p-4">
          <span
            className={`text-lg font-medium px-4 py-2 rounded-full ${
              status === "ACCEPTED"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : status === "REJECTED"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {status === "VOTING" && isTimeExpired
              ? "Pending Final Status"
              : status}
          </span>
        </div>
        <div className="mt-4 text-sm text-center text-f-tertiary dark:text-darkMuted">
          Voting ended on {endDate.toLocaleString()}
        </div>
      </div>
    );
  }

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

const allowedAddresses = [
  "AU1xs4LUr2XsFhe4YB756bEB2aG59k2Dy2LzLYgYR8zH4o2ZWv5G",
  "AU12wiZMwocjfWZKZhzP2dR86PBXJfGCoKY5wi6q1cSQoquMekvfJ",
  "AU1bTSHvZG7cdUUu4ScKwQVFum3gB5TDpdi9yMRv2bnedYUyptsa",
  "AU1DjgRMPCfnSvDcY3TXkbSQNDpsLQ3NUfCMrisT7xzwWsSe9V4s",
  "AU1qTGByMtnFjzU47fQG6SjAj45o5icS3aonzhj1JD1PnKa1hQ5",
  "AU1wfDH3BNBiFF9Nwko6g8q5gMzHW8KUHUL2YysxkZKNZHq37AfX",
  "AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF",
];

interface AdminActionsProps {
  proposalId: bigint;
  status: string;
}

function AdminActions({ proposalId, status }: AdminActionsProps) {
  const { connectedAccount } = useAccountStore();
  const { governance } = useContractStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  // Add debug information
  console.log("Connected account:", connectedAccount?.address);
  console.log(
    "Is admin:",
    connectedAccount && allowedAddresses.includes(connectedAccount.address)
  );
  console.log("Allowed addresses:", allowedAddresses);

  if (
    !connectedAccount ||
    !allowedAddresses.includes(connectedAccount.address)
  ) {
    return null;
  }

  const canChangeStatus =
    status.toUpperCase() === "DISCUSSION" || status.toUpperCase() === "VOTING";

  const handleNextStatus = async () => {
    if (!governance?.private) return;
    await callSmartContract(
      "nextStatus",
      governance.private.address,
      new Args().addU64(proposalId).serialize(),
      {
        success: "Status updated successfully!",
        pending: "Updating status...",
        error: "Failed to update status",
      }
    );
  };

  const handleDelete = async () => {
    if (!governance?.private) return;
    await callSmartContract(
      "deleteProposal",
      governance.private.address,
      new Args().addU64(proposalId).serialize(),
      {
        success: "Proposal deleted successfully!",
        pending: "Deleting proposal...",
        error: "Failed to delete proposal",
      }
    );
  };

  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-f-primary dark:text-darkText mb-4">
        Admin Actions
      </h3>
      <div className="flex flex-col gap-4">
        {canChangeStatus && (
          <PixelButton onClick={handleNextStatus} fullWidth variant="primary">
            Next Status
          </PixelButton>
        )}
        <PixelButton onClick={handleDelete} fullWidth variant="secondary">
          Delete Proposal
        </PixelButton>
      </div>
    </div>
  );
}

export default function ProposalDetails() {
  const { id } = useParams<{ id: string }>();
  const { proposals, userMasogBalance, userVotes, proposalVotesMap, loading } =
    useGovernanceData();

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
          {proposal.parameterChange && proposal.parameterChange !== "{}" && (
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

          <VotingPeriod
            creationTimestamp={proposal.creationTimestamp}
            status={proposal.status}
          />

          <AdminActions proposalId={proposal.id} status={proposal.status} />
        </div>
      </div>

      <VoteModal />
    </div>
  );
}
