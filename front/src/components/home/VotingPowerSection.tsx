interface VotingPowerSectionProps {
  loading: boolean;
  userMasogBalance: bigint;
  userVotingPower: bigint;
}

export function VotingPowerSection({
  loading,
  userMasogBalance,
  userVotingPower,
}: VotingPowerSectionProps) {
  return (
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
  );
}
