interface VotingPowerSectionProps {
  loading: boolean;
  userMasogBalance: bigint | null;
  userVotingPower: bigint | null;
}

export function VotingPowerSection({
  loading,
  userMasogBalance,
  userVotingPower,
}: VotingPowerSectionProps) {
  const formatValue = (value: bigint | null) => {
    if (loading || value === null) return "...";
    return value.toString();
  };

  return (
    <section className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-f-primary mb-4 mas-h2">
        Your Voting Power
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm text-f-tertiary mb-2 mas-h3">MASOG Balance</h3>
          <p className="text-2xl font-bold text-brand">
            {formatValue(userMasogBalance)}
          </p>
        </div>
        <div>
          <h3 className="text-sm text-f-tertiary mb-2 mas-h3">Voting Power</h3>
          <p className="text-2xl font-bold text-brand">
            {formatValue(userVotingPower)}
          </p>
        </div>
      </div>
    </section>
  );
}
