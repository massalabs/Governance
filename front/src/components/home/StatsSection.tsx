import { GovernanceStats } from "../../types/governance";

interface StatsSectionProps {
  loading: boolean;
  stats: GovernanceStats;
}

export function StatsSection({ loading, stats }: StatsSectionProps) {
  const formatValue = (value: bigint | null) => {
    if (loading || value === null) return "...";
    return value.toString();
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
          Total Proposals
        </h2>
        <p className="text-3xl font-bold text-brand">
          {formatValue(stats.totalProposals)}
        </p>
      </div>

      <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
          Pending
        </h2>
        <p className="text-3xl font-bold text-brand">
          {formatValue(stats.votingProposals)}
        </p>
      </div>

      <div className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
          Total Votes
        </h2>
        <p className="text-3xl font-bold text-brand">
          {formatValue(stats.totalVotes)}
        </p>
      </div>
    </section>
  );
}
