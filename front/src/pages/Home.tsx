import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useGovernanceStore } from "../store/useGovernanceStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ConnectButton } from "../components/ConnectWalletPopup";

export default function Home() {
  const {
    stats,
    loading,
    proposals,
    userMasogBalance,
    userVotingPower,
    fetchProposals,
    fetchStats,
    fetchUserBalance,
  } = useGovernanceStore();
  const { connectedAccount } = useAccountStore();

  useEffect(() => {
    if (connectedAccount) {
      console.log(connectedAccount);
      const fetchData = async () => {
        await Promise.all([fetchProposals(), fetchStats(), fetchUserBalance()]);
      };
      fetchData();
    }
  }, [connectedAccount, fetchProposals, fetchStats, fetchUserBalance]);

  if (!connectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
        <h1 className="text-2xl font-bold text-f-primary mas-title">
          Welcome to Massa Governance
        </h1>
        <p className="text-f-tertiary mas-body text-center max-w-md">
          Connect your wallet to view and participate in governance proposals
        </p>
        <ConnectButton />
      </div>
    );
  }

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
            {loading ? "..." : stats.totalProposals.toString()}
          </p>
        </div>

        <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
            Active Proposals
          </h2>
          <p className="text-3xl font-bold text-brand">
            {loading ? "..." : stats.activeProposals.toString()}
          </p>
        </div>

        <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
            Total Votes
          </h2>
          <p className="text-3xl font-bold text-brand">
            {loading ? "..." : stats.totalVotes.toString()}
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
              {loading ? "..." : `${userMasogBalance.toString()} MASOG`}
            </p>
          </div>
          <div>
            <p className="text-f-tertiary mb-2 mas-body">Voting Power</p>
            <p className="text-xl font-semibold text-f-primary mas-h3">
              {loading ? "..." : userVotingPower.toString()}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-f-primary mas-subtitle">
            Recent Proposals
          </h2>
          <Link
            to="/proposals"
            className="text-brand hover:text-brand/80 flex items-center gap-2 mas-buttons"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-f-tertiary">
            Loading proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-8 text-f-tertiary">
            No proposals found
          </div>
        ) : (
          <div className="grid gap-4">
            {proposals.slice(0, 3).map((proposal) => (
              <Link
                key={proposal.id.toString()}
                to={`/proposals/${proposal.id}`}
                className="bg-secondary border border-border p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-f-primary group-hover:text-brand mas-h2">
                      {proposal.title}
                    </h3>
                    <p className="mt-2 text-sm text-f-tertiary mas-body2 line-clamp-2">
                      {proposal.summary}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.status === "votingStatus"
                        ? "bg-green-100 text-green-800"
                        : proposal.status === "executedStatus"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {proposal.status.replace("Status", "")}
                  </span>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-f-tertiary mas-body2">
                  <span>Yes: {proposal.positiveVoteVolume.toString()}</span>
                  <span>No: {proposal.negativeVoteVolume.toString()}</span>
                  <span>Abstain: {proposal.blankVoteVolume.toString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
