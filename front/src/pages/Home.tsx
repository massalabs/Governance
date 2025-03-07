import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useGovernanceStore } from "../store/useGovernanceStore";

export default function Home() {
  const { stats } = useGovernanceStore();

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-f-primary mb-4 mas-banner">
          Welcome to Governance Portal
        </h1>
        <p className="text-f-tertiary max-w-2xl mx-auto mas-body">
          Participate in the decision-making process of our platform. Vote on
          proposals and help shape the future of our ecosystem.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
            Total Proposals
          </h2>
          <p className="text-3xl font-bold text-brand">
            {stats.totalProposals.toString()}
          </p>
        </div>

        <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
            Active Proposals
          </h2>
          <p className="text-3xl font-bold text-brand">
            {stats.activeProposals.toString()}
          </p>
        </div>

        <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
            Total Votes
          </h2>
          <p className="text-3xl font-bold text-brand">
            {stats.totalVotes.toString()}
          </p>
        </div>
      </section>

      <section className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-f-primary mb-4 mas-subtitle">
          Your Voting Power
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-f-tertiary mb-2 mas-body">MASOG Balance</p>
            <p className="text-xl font-semibold text-f-primary mas-h3">
              {stats.userMasogBalance.toString()} MASOG
            </p>
          </div>
          <div>
            <p className="text-f-tertiary mb-2 mas-body">Voting Power</p>
            <p className="text-xl font-semibold text-f-primary mas-h3">
              {stats.userVotingPower.toString()}
            </p>
          </div>
        </div>
      </section>

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
    </div>
  );
}
