import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export function ActionLinks() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/proposals"
        className="bg-secondary border border-border p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group active-button"
      >
        <h3 className="text-lg font-medium text-f-primary group-hover:text-brand mas-h2">
          View Proposals
        </h3>
        <p className="mt-2 text-sm text-f-tertiary mas-body2">
          Browse and vote on active governance proposals
        </p>
        <div className="mt-4 flex items-center text-brand">
          <span className="text-sm font-medium mas-buttons">
            View all proposals
          </span>
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </div>
      </Link>

      <Link
        to="/create"
        className="bg-secondary border border-border p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group active-button"
      >
        <h3 className="text-lg font-medium text-f-primary group-hover:text-brand mas-h2">
          Create Proposal
        </h3>
        <p className="mt-2 text-sm text-f-tertiary mas-body2">
          Submit a new governance proposal
        </p>
        <div className="mt-4 flex items-center text-brand">
          <span className="text-sm font-medium mas-buttons">
            Create proposal
          </span>
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
