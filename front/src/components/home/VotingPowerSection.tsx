import { useMasogTotalSupply } from "../../hooks/queries/useMasogData";
import { BalanceDisplay } from "./BalanceDisplay";
import { NotConnectedCard } from "./NotConnectedCard";
import { ZeroBalanceCard } from "./ZeroBalanceCard";

interface VotingPowerSectionProps {
  loading: boolean;
  userMasogBalance: bigint | null;
  isConnected?: boolean;
}

export function VotingPowerSection({
  loading,
  userMasogBalance,
  isConnected = true,
}: VotingPowerSectionProps) {
  const { data: totalSupply } = useMasogTotalSupply();
  const hasZeroBalance = userMasogBalance === 0n;

  return (
    <section className="bg-secondary dark:bg-darkCard border border-border dark:border-darkBorder p-6 rounded-lg shadow-sm">
      <div className="space-y-6">
        <header>
          <h2 className="text-lg font-semibold text-f-primary dark:text-darkText mb-2 mas-h2">
            Your Voting Power
          </h2>
          <p className="text-sm text-f-tertiary dark:text-darkMuted mb-6">
            Your voting power is determined by your MASOG token balance. MASOG
            tokens are minted based on your staked rolls in the Massa network,
            directly linking your governance influence to your staking
            activity.
          </p>
        </header>

        {!isConnected ? (
          <NotConnectedCard />
        ) : hasZeroBalance ? (
          <ZeroBalanceCard />
        ) : (
          <BalanceDisplay
            balance={userMasogBalance}
            totalSupply={totalSupply}
            loading={loading}
          />
        )}
      </div>
    </section>
  );
}