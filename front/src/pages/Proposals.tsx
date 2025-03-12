import { Link } from "react-router-dom";

import { useGovernanceStore } from "../store/useGovernanceStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ConnectButton } from "../components/connect-wallet-popup";
import VoteModal from "../components/VoteModal";
import { ProposalCard } from "../components/proposals/ProposalCard";

export default function Proposals() {
  const { proposals, loading, userMasogBalance, userVotes } =
    useGovernanceStore();
  const { connectedAccount } = useAccountStore();

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
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id.toString()}
              proposal={proposal}
              userMasogBalance={userMasogBalance}
              hasVoted={userVotes[proposal.id.toString()] !== undefined}
            />
          ))}
        </div>
      )}
      <VoteModal />
    </div>
  );
}
