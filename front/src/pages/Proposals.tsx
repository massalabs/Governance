import { useState, useCallback } from "react";

import { ProposalCard } from "../components/proposals/ProposalCard";
import { ProposalFilters } from "../components/proposals/ProposalFilters";
import { FormattedProposal, ProposalStatus } from "../types/governance";
import { useGovernanceData } from "../hooks/queries/useGovernanceData";
import VoteModal from "@/components/VoteModal";

const filterProposals = (
  proposals: FormattedProposal[],
  searchQuery: string,
  selectedStatus: ProposalStatus | "all"
): FormattedProposal[] => {
  return proposals.filter((proposal) => {
    const matchesSearch = proposal.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || proposal.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg">
    <h3 className="text-xl font-medium text-gray-600 mb-2">No Proposals</h3>
    <p className="text-gray-400 max-w-md text-center">{message}</p>
  </div>
);

export default function Proposals() {
  const { proposals: allProposals, loading } = useGovernanceData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | "all">(
    "all"
  );

  const filteredProposals = filterProposals(
    allProposals,
    searchQuery,
    selectedStatus
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusChange = useCallback(
    (status: ProposalStatus | "all") => {
      setSelectedStatus(status);
    },
    []
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8 text-f-tertiary">
          Loading proposals...
        </div>
      );
    }

    if (allProposals.length === 0) {
      return <EmptyState message="There are no proposals yet." />;
    }

    if (filteredProposals.length === 0) {
      return (
        <EmptyState message="No proposals found matching your search criteria. Try adjusting your filters." />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProposals.map((proposal) => (
          <ProposalCard key={proposal.id.toString()} proposal={proposal} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ProposalFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />
      {renderContent()}
      <VoteModal />
    </div>
  );
}