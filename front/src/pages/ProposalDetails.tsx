import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { VoteProgress } from "../components/proposals/VoteProgress";
import { useGovernanceData } from "../hooks/useGovernanceData";
import { useUIStore } from "../store/useUIStore";
import { Loading } from "@/components/ui/Loading";
import VoteModal from "../components/VoteModal";
import { VoteComments } from "../components/proposals/VoteComments";
import { ProposalHeader } from "../components/proposals/details/ProposalHeader";
import { BasicInfoSection } from "../components/proposals/details/BasicInfoSection";
import { TechnicalDetailsSection } from "../components/proposals/details/TechnicalDetailsSection";
import { VoteAction } from "../components/proposals/details/VoteAction";
import { VotingPeriod } from "../components/proposals/details/VotingPeriod";
import { AdminActions } from "../components/proposals/details/AdminActions";

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
    positive: proposalVotes.filter((v) => v.value === 1n).length,
    negative: proposalVotes.filter((v) => v.value === -1n).length,
    blank: proposalVotes.filter((v) => v.value === 0n).length,
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
          {/* Vote Comments Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
              Vote Comments
            </h2>
            <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
              <VoteComments proposalId={proposal.id} />
            </div>
          </div>
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
