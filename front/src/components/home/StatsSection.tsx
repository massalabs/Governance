import { GovernanceStats } from "../../types/governance";

interface StatsSectionProps {
  isLoading: boolean;
  stats: GovernanceStats;
}

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <div className="bg-secondary dark:bg-darkCard border border-border dark:border-darkBorder p-6 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold text-f-primary dark:text-darkText mb-2 mas-h2">
      {title}
    </h2>
    <p className="text-3xl font-bold text-brand dark:text-darkAccent">
      {value}
    </p>
  </div>
);

const formatNumber = (value: bigint | null, isLoading: boolean): string => {
  if (isLoading || value === null) return "...";
  return new Intl.NumberFormat().format(Number(value));
};

export function StatsSection({ isLoading, stats }: StatsSectionProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Proposals"
        value={formatNumber(stats.totalProposals, isLoading)}
      />
      <StatCard
        title="Proposals in Voting"
        value={formatNumber(stats.votingProposals, isLoading)}
      />
      <StatCard
        title="Total Votes"
        value={formatNumber(stats.totalVotes, isLoading)}
      />
    </section>
  );
}