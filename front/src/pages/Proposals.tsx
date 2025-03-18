import { useState } from "react";
import VoteModal from "../components/VoteModal";
import { ProposalCard } from "../components/proposals/ProposalCard";
import { ProposalFilters } from "../components/proposals/ProposalFilters";
import { ProposalStatus } from "../types/governance";
import { useGovernanceData } from "../hooks/useGovernanceData";

export default function Proposals() {
  const { proposals: allProposals, loading } = useGovernanceData();

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
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
