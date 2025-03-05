import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Massa Governance
        </h1>
        <p className="mt-3 text-xl text-gray-500">
          Participate in the governance of the Massa blockchain
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/proposals"
          className="card hover:shadow-md transition-shadow group"
        >
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
            View Proposals
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Browse and vote on active governance proposals
          </p>
          <div className="mt-4 flex items-center text-primary-600">
            <span className="text-sm font-medium">View all proposals</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/create"
          className="card hover:shadow-md transition-shadow group"
        >
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
            Create Proposal
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Submit a new governance proposal
          </p>
          <div className="mt-4 flex items-center text-primary-600">
            <span className="text-sm font-medium">Create proposal</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">
            Governance Stats
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Active Proposals</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Proposals</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Votes Cast</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
