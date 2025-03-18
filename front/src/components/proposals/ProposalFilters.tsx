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

const statusConfigs: Record<
  string,
  { label: string; color: string; darkColor: string }
> = {
  DISCUSSION: {
    label: "Discussion",
    color: "text-blue-500",
    darkColor: "dark:text-blue-400",
  },
  VOTING: {
    label: "Voting",
    color: "text-brand",
    darkColor: "dark:text-darkAccent",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-s-success",
    darkColor: "dark:text-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-s-error",
    darkColor: "dark:text-rose-400",
  },
};

export function ProposalFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: ProposalFiltersProps) {
  return (
    <div className="bg-secondary dark:bg-darkCard border border-border dark:border-darkBorder rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-f-tertiary dark:text-darkMuted" />
          </div>
          <Input
            placeholder="Search proposals by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 h-10 bg-secondary dark:bg-darkCard border-border dark:border-darkBorder text-f-primary dark:text-darkText placeholder:text-f-tertiary dark:placeholder:text-darkMuted focus:ring-brand/20 dark:focus:ring-darkAccent/20"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) =>
                onStatusChange(e.target.value as ProposalStatus | "all")
              }
              className="appearance-none px-4 py-2 bg-secondary dark:bg-darkCard border border-border dark:border-darkBorder rounded-lg text-f-primary dark:text-darkText focus:outline-none focus:ring-2 focus:ring-brand/20 dark:focus:ring-darkAccent/20 cursor-pointer pr-10 h-10"
            >
              <option
                value="all"
                className="text-f-tertiary dark:text-darkMuted"
              >
                All Status
              </option>
              {Object.entries(statusConfigs).map(([status, config]) => (
                <option
                  key={status}
                  value={status}
                  className={`${config.color} ${config.darkColor}`}
                >
                  {config.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-f-tertiary dark:text-darkMuted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
