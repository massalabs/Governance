import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { VoteProgress } from "@/components/proposals/VoteProgress";
import { useGovernanceData } from "@/react-queries/useGovernanceData";
import { useUIStore } from "@/store/useUIStore";
import { Loading } from "@/components/ui/Loading";
import VoteModal from "@/components/proposals/VoteModal";
import { ProposalHeader } from "@/components/proposals/details/ProposalHeader";
import { BasicInfoSection } from "@/components/proposals/details/BasicInfoSection";
import { TechnicalDetailsSection } from "../components/proposals/details/TechnicalDetailsSection";
import { VoteAction } from "../components/proposals/details/VoteAction";
import { AdminActions } from "../components/proposals/details/AdminActions";
import { ProposalStatus } from "../components/proposals/details/ProposalStatus";
import { ProposalStatus as ProposalStatusEnum } from "@/config";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { useMemo } from "react";
import { DISCUSSION_PERIOD, MIN_VOTE_MASOG_AMOUNT, VOTING_PERIOD, networkName } from "@/config";
import { useVotingStore } from "@/react-queries/useVotingStore";

const BackButton = () => (
  <Link
    to="/proposals"
    className="inline-flex items-center gap-2 text-f-tertiary dark:text-darkMuted hover:text-f-primary dark:hover:text-darkText transition-colors"
  >
    <ArrowLeftIcon className="h-5 w-5" />
    <span>Back to Proposals</span>
  </Link>
);

const ConnectWalletPrompt = () => (
  <div className="bg-primary/10 dark:bg-darkPrimary/10 border-2 border-primary/30 dark:border-darkPrimary/30 rounded-lg p-6 text-center">
    <p className="text-primary dark:text-darkPrimary font-medium text-lg mb-2">
      Connect Your Wallet to Vote
    </p>
    <p className="text-f-tertiary dark:text-darkMuted">
      You need to connect your wallet to participate in this proposal's voting process
    </p>
  </div>
);

const NetworkSwitchPrompt = () => (
  <div className="bg-primary/10 dark:bg-darkPrimary/10 border-2 border-primary/30 dark:border-darkPrimary/30 rounded-lg p-6 text-center">
    <p className="text-primary dark:text-darkPrimary font-medium text-lg mb-2">
      Switch Network to Vote
    </p>
    <p className="text-f-tertiary dark:text-darkMuted">
      Please switch to {networkName} to participate in this proposal's voting process
    </p>
  </div>
);

export default function ProposalDetails() {
  const { id } = useParams<{ id: string }>();
  const { connectedAccount, network } = useAccountStore();
  const { proposals, userMasogBalance, loading: loadingProposals } = useGovernanceData();
  const { openVoteModal } = useUIStore();

  const proposal = useMemo(() => proposals.find((p) => p.id.toString() === id), [proposals, id]);
  const { hasUserVoted, loadingVoteProgress } = useVotingStore(proposal ? [proposal] : []);

  const votingStatus = useMemo(() => {
    if (!proposal) return { canShowVoting: false, hasVoted: false, canVote: false, isVotingEnded: false };
    const isVoting = proposal.status === "VOTING";
    const hasVoted = hasUserVoted(proposal.id);
    const canVote = (userMasogBalance ?? 0n) >= MIN_VOTE_MASOG_AMOUNT;
    const isVotingEnded = new Date().getTime() > Number(proposal.creationTimestamp) + Number(DISCUSSION_PERIOD) + Number(VOTING_PERIOD);
    return { canShowVoting: isVoting && !isVotingEnded, hasVoted, canVote, isVotingEnded };
  }, [proposal, userMasogBalance, hasUserVoted]);

  if (loadingProposals) {
    return <Loading text="Loading proposal details..." />;
  }

  if (!proposal) {
    return (
      <div className="text-center py-8 text-f-tertiary dark:text-darkMuted">
        Proposal not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-8">
          <ProposalHeader proposal={proposal} />
          <BasicInfoSection summary={proposal.summary} />
          {proposal.parameterChange && proposal.parameterChange !== "{}" && (
            <TechnicalDetailsSection parameterChange={proposal.parameterChange} />
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <ProposalStatus proposal={proposal} />
          {votingStatus.canShowVoting && (
            connectedAccount ? (
              network?.name === networkName ? (
                <VoteAction
                  hasVoted={votingStatus.hasVoted}
                  canVote={votingStatus.canVote}
                  onVote={() => openVoteModal(proposal.id)}
                />
              ) : (
                <NetworkSwitchPrompt />
              )
            ) : (
              <ConnectWalletPrompt />
            )
          )}
          {proposal.status !== ProposalStatusEnum.DISCUSSION && (
            <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
              {loadingVoteProgress ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loading text="Loading voting data..." />
                  <p className="text-sm text-f-tertiary dark:text-darkMuted text-center">
                    Please wait while we fetch the latest voting results...
                  </p>
                </div>
              ) : (
                <VoteProgress
                  proposal={{
                    ...proposal,
                    positiveVoteVolume: proposal.positiveVoteVolume,
                    negativeVoteVolume: proposal.negativeVoteVolume,
                    blankVoteVolume: proposal.blankVoteVolume,
                  }}
                />
              )}
            </div>
          )}

          <AdminActions proposalId={proposal.id} />
        </div>
      </div>

      <VoteModal />
    </div>
  );
}