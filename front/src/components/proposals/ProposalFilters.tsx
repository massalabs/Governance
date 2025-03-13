import { Input } from "@massalabs/react-ui-kit";
import { ProposalStatus } from "../../types/governance";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface ProposalFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: ProposalStatus | "all";
  onStatusChange: (status: ProposalStatus | "all") => void;
}

const statusConfigs: Record<string, { label: string; color: string }> = {
  DISCUSSION: { label: "Discussion", color: "text-blue-500" },
  VOTING: { label: "Voting", color: "text-brand" },
  ACCEPTED: { label: "Accepted", color: "text-s-success" },
  REJECTED: { label: "Rejected", color: "text-s-error" },
};

export function ProposalFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: ProposalFiltersProps) {
  return (
    <div className="bg-secondary border border-border rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-f-tertiary" />
          </div>
          <Input
            placeholder="Search proposals by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 h-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) =>
                onStatusChange(e.target.value as ProposalStatus | "all")
              }
              className="appearance-none px-4 py-2 bg-secondary border border-border rounded-lg text-f-primary focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer pr-10 h-10"
            >
              <option value="all" className="text-f-tertiary">
                All Status
              </option>
              {Object.entries(statusConfigs).map(([status, config]) => (
                <option key={status} value={status} className={config.color}>
                  {config.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-f-tertiary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
