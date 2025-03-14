import { useMasogTotalSupply } from "../../hooks/useMasogData";

interface VotingPowerSectionProps {
  loading: boolean;
  userMasogBalance: bigint | null;
  userVotingPower: bigint | null;
}

export function VotingPowerSection({
  loading,
  userMasogBalance,
}: VotingPowerSectionProps) {
  const { data: totalSupply } = useMasogTotalSupply();

  const formatValue = (value: bigint | null) => {
    if (loading || value === null) return "...";
    return value.toString();
  };

  const calculateVotingPowerPercentage = () => {
    if (!userMasogBalance || !totalSupply || totalSupply === 0n) return "0";
    return ((Number(userMasogBalance) / Number(totalSupply)) * 100).toFixed(2);
  };

  return (
    <section className="bg-secondary border border-border p-6 rounded-lg shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-f-primary mb-2 mas-h2">
            Your Voting Power
          </h2>
          <p className="text-sm text-f-tertiary mb-6">
            Your voting power is determined by your MASOG token balance. MASOG
            tokens are minted based on your staked rolls in the Massa network,
            directly linking your governance influence to your staking activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm text-f-tertiary mb-1 mas-h3">
              MASOG Balance
            </h3>
            <p className="text-2xl font-bold text-brand">
              {formatValue(userMasogBalance)}
            </p>
            <p className="text-xs text-f-tertiary">
              Minted from your staked rolls
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm text-f-tertiary mb-1 mas-h3">
              Voting Power
            </h3>
            <p className="text-2xl font-bold text-brand">
              {calculateVotingPowerPercentage()}%
            </p>
            <p className="text-xs text-f-tertiary">
              Of total MASOG supply ({formatValue(totalSupply ?? null)} MASOG)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
