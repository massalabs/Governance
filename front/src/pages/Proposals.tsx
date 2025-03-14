import { Link } from "react-router-dom";
import { useState } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ConnectButton } from "../components/connect-wallet-popup";
import VoteModal from "../components/VoteModal";
import { ProposalCard } from "../components/proposals/ProposalCard";
import { ProposalFilters } from "../components/proposals/ProposalFilters";
import { ProposalStatus } from "../types/governance";
import { useGovernanceData } from "../hooks/useGovernanceData";
import { useProposals } from "../hooks/useProposals";

export default function Proposals() {
  const { connectedAccount } = useAccountStore();
  const { proposals: allProposals, loading } = useGovernanceData();
  const { proposals } = useProposals();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | "all">(
    "all"
  );

  const filteredProposals = allProposals.filter((proposal) => {
    const matchesSearch = proposal.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || proposal.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-f-primary mas-title">Proposals</h1>
      </div>

      <ProposalFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {loading ? (
        <div className="text-center py-8 text-f-tertiary">
          Loading proposals...
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-8 text-f-tertiary">
          No proposals found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id.toString()} proposal={proposal} />
          ))}
        </div>
      )}
      <VoteModal />
    </div>
  );
}
