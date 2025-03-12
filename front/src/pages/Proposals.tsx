import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useGovernanceStore } from "../store/useGovernanceStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ConnectButton } from "../components/ConnectWalletPopup";
import {
  ClockIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Address } from "@massalabs/massa-web3";
import VoteModal from "../components/VoteModal";
import { useUIStore } from "../store/useUIStore";

export const truncateAddress = (
  address?: string,
  startLength = 6,
  endLength = 4
) => {
  if (!address) return "";
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const isValidAddress = (address: string): boolean => {
  try {
    return Address.fromString(address).isEOA;
  } catch (error) {
    return false;
  }
};

interface StatusConfig {
  icon: typeof ClockIcon;
  color: string;
  bgColor: string;
  label: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  VOTING: {
    icon: ClockIcon,
    color: "text-brand",
    bgColor: "bg-brand/10",
    label: "Voting",
  },
  ACTIVE: {
    icon: ClockIcon,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Active",
  },
  EXECUTED: {
    icon: CheckBadgeIcon,
    color: "text-s-success",
    bgColor: "bg-s-success/10",
    label: "Executed",
  },
  EXPIRED: {
    icon: ClockIcon,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: "Expired",
  },
  CANCELLED: {
    icon: CheckBadgeIcon,
    color: "text-s-error",
    bgColor: "bg-s-error/10",
    label: "Cancelled",
  },
};

export default function Proposals() {
  const {
    proposals,
    loading,
    fetchProposals,
    userMasogBalance,
    userVotes,
    fetchUserVotes,
  } = useGovernanceStore();
  const { connectedAccount } = useAccountStore();
  const { openVoteModal } = useUIStore();

  useEffect(() => {
    const fetchData = async () => {
      if (connectedAccount) {
        await Promise.all([fetchProposals(), fetchUserVotes()]);
        console.log("User votes:", userVotes); // Debug log
      }
    };
    fetchData();
  }, [fetchProposals, fetchUserVotes, connectedAccount, userVotes]);

  if (!connectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <h1 className="text-2xl font-bold text-f-primary mas-title">
          Welcome to Governance
        </h1>
        <p className="text-f-tertiary mas-body text-center max-w-md">
          Connect your wallet to view and participate in governance proposals
        </p>
        <ConnectButton />
      </div>
    );
  }

  const isValidForumLink = (link: string) => {
    return link.startsWith("https://forum.massa.community/");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-f-primary mas-title">Proposals</h1>
        <Link
          to="/create"
          className="px-4 py-2 bg-brand text-neutral rounded-lg hover:opacity-90 active-button mas-buttons"
        >
          Create Proposal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-f-tertiary">
          Loading proposals...
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-8 text-f-tertiary">
          No proposals found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((proposal) => {
            const normalizedStatus = proposal.status.toUpperCase();
            const statusConfig = statusConfigs[normalizedStatus] || {
              icon: ClockIcon,
              color: "text-f-tertiary",
              bgColor: "bg-f-tertiary/10",
              label: proposal.status,
            };
            const StatusIcon = statusConfig.icon;
            const statusColor = statusConfig.color;
            const statusBgColor = statusConfig.bgColor;
            const statusLabel = statusConfig.label;
            const hasValidForumLink = isValidForumLink(proposal.forumPostLink);
            const canVote =
              normalizedStatus === "VOTING" && userMasogBalance >= 1n;
            const hasVoted = userVotes[proposal.id.toString()] !== undefined;
            console.log(`Proposal ${proposal.id.toString()} vote status:`, {
              hasVoted,
              userVotes,
              proposalId: proposal.id.toString(),
            });

            return (
              <div
                key={proposal.id.toString()}
                className="bg-secondary border border-border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-f-primary mas-h2">
                          {proposal.title}
                        </h2>
                        <span className="text-f-tertiary mas-caption bg-tertiary px-2 py-0.5 rounded">
                          #{proposal.id.toString()}
                        </span>
                      </div>
                      <p className="text-f-tertiary mas-body">
                        {proposal.summary}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}
                    >
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {statusLabel}
                    </span>
                  </div>

                  {/* Basic Info Section */}
                  <div className="flex items-center gap-4 text-f-tertiary mas-caption">
                    <span>Created by: {truncateAddress(proposal.owner)}</span>
                    <span>•</span>
                    <span>
                      {new Date(
                        Number(proposal.creationTimestamp)
                      ).toLocaleDateString()}
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

                  {/* Voting Section */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-4">
                      <h3 className="text-f-primary mas-h3">
                        Vote Distribution
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-f-tertiary mas-body2">Yes</span>
                          <span className="text-f-primary mas-body2">
                            {proposal.positiveVoteVolume.toString()}
                          </span>
                        </div>
                        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-s-success"
                            style={{
                              width: `${
                                proposal.positiveVoteVolume === 0n &&
                                proposal.negativeVoteVolume === 0n &&
                                proposal.blankVoteVolume === 0n
                                  ? 0
                                  : (Number(proposal.positiveVoteVolume) /
                                      Number(
                                        proposal.positiveVoteVolume +
                                          proposal.negativeVoteVolume +
                                          proposal.blankVoteVolume
                                      )) *
                                    100
                              }%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-f-tertiary mas-body2">No</span>
                          <span className="text-f-primary mas-body2">
                            {proposal.negativeVoteVolume.toString()}
                          </span>
                        </div>
                        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-s-error"
                            style={{
                              width: `${
                                proposal.positiveVoteVolume === 0n &&
                                proposal.negativeVoteVolume === 0n &&
                                proposal.blankVoteVolume === 0n
                                  ? 0
                                  : (Number(proposal.negativeVoteVolume) /
                                      Number(
                                        proposal.positiveVoteVolume +
                                          proposal.negativeVoteVolume +
                                          proposal.blankVoteVolume
                                      )) *
                                    100
                              }%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-f-tertiary mas-body2">
                            Abstain
                          </span>
                          <span className="text-f-primary mas-body2">
                            {proposal.blankVoteVolume.toString()}
                          </span>
                        </div>
                        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-f-tertiary"
                            style={{
                              width: `${
                                proposal.positiveVoteVolume === 0n &&
                                proposal.negativeVoteVolume === 0n &&
                                proposal.blankVoteVolume === 0n
                                  ? 0
                                  : (Number(proposal.blankVoteVolume) /
                                      Number(
                                        proposal.positiveVoteVolume +
                                          proposal.negativeVoteVolume +
                                          proposal.blankVoteVolume
                                      )) *
                                    100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex justify-end pt-4 border-t border-border">
                    {normalizedStatus === "VOTING" && (
                      <>
                        {hasVoted ? (
                          <div className="flex items-center gap-2 text-s-success">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="mas-caption">Already Voted</span>
                          </div>
                        ) : canVote ? (
                          <button
                            onClick={() => openVoteModal(proposal.id)}
                            className="px-4 py-2 bg-brand text-neutral rounded-lg hover:opacity-90 active-button mas-buttons"
                          >
                            Vote
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-s-error mas-caption">
                              Minimum 1 MASOG required to vote
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <VoteModal />
    </div>
  );
}
