import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useGovernanceStore } from "../store/useGovernanceStore";

export default function Home() {
  const { stats } = useGovernanceStore();

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark mb-4">
          Welcome to Governance Portal
        </h1>
        <p className="text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto">
          Participate in the decision-making process of our platform. Vote on
          proposals and help shape the future of our ecosystem.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
            Total Proposals
          </h2>
          <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">
            {stats.totalProposals.toString()}
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
            Active Proposals
          </h2>
          <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">
            {stats.activeProposals.toString()}
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
            Total Votes
          </h2>
          <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">
            {stats.totalVotes.toString()}
          </p>
        </div>
      </section>

      <section className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
          Your Voting Power
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-secondary-light dark:text-secondary-dark mb-2">
              MASOG Balance
            </p>
            <p className="text-xl font-semibold text-text-light dark:text-text-dark">
              {stats.userMasogBalance.toString()} MASOG
            </p>
          </div>
          <div>
            <p className="text-secondary-light dark:text-secondary-dark mb-2">
              Voting Power
            </p>
            <p className="text-xl font-semibold text-text-light dark:text-text-dark">
              {stats.userVotingPower.toString()}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/proposals"
          className="card hover:shadow-md transition-shadow group"
        >
          <h3 className="text-lg font-medium text-text-light dark:text-text-dark group-hover:text-primary-light dark:group-hover:text-primary-dark">
            View Proposals
          </h3>
          <p className="mt-2 text-sm text-secondary-light dark:text-secondary-dark">
            Browse and vote on active governance proposals
          </p>
          <div className="mt-4 flex items-center text-primary-light dark:text-primary-dark">
            <span className="text-sm font-medium">View all proposals</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/create"
          className="card hover:shadow-md transition-shadow group"
        >
          <h3 className="text-lg font-medium text-text-light dark:text-text-dark group-hover:text-primary-light dark:group-hover:text-primary-dark">
            Create Proposal
          </h3>
          <p className="mt-2 text-sm text-secondary-light dark:text-secondary-dark">
            Submit a new governance proposal
          </p>
          <div className="mt-4 flex items-center text-primary-light dark:text-primary-dark">
            <span className="text-sm font-medium">Create proposal</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
