interface StatsSectionProps {
  loading: boolean;
  stats: {
    totalProposals: bigint;
    votingProposals: bigint;
    totalVotes: bigint;
  };
}

export function StatsSection({ loading, stats }: StatsSectionProps) {
  return (
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
          Pending
        </h2>
        <p className="text-3xl font-bold text-brand">
          {loading ? "..." : stats.votingProposals.toString()}
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
  );
}
