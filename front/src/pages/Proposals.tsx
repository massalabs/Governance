import { useState, useEffect } from "react";
import VoteModal from "../components/VoteModal";
import { ProposalCard } from "../components/proposals/ProposalCard";
import { ProposalFilters } from "../components/proposals/ProposalFilters";
import { ProposalStatus } from "../types/governance";
import { useGovernanceData } from "../hooks/queries/useGovernanceData";

export default function Proposals() {
  const { proposals: allProposals, loading, refresh } = useGovernanceData();

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      ) : allProposals.length === 0 ? (
        <div className="text-center">
          <h3 className="text-gray-600">There is no proposals yet.</h3>

        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Proposals</h3>
          <p className="text-gray-600">No proposals found matching your search criteria. Try adjusting your filters.</p>
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
