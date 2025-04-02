import { useGovernanceData } from "../hooks/queries/useGovernanceData";
import { WelcomeSection } from "../components/home/WelcomeSection";
import { StatsSection } from "../components/home/StatsSection";
import { VotingPowerSection } from "../components/home/VotingPowerSection";
import { RecentProposalsSection } from "../components/home/RecentProposalsSection";
import { ActionLinks } from "../components/home/ActionLinks";
import { BetaBanner } from "../components/home/BetaBanner";
import { useAccountStore } from "@massalabs/react-ui-kit";
// import { useAccountStore } from "@massalabs/react-ui-kit";

export default function Home() {
  const { connectedAccount } = useAccountStore();
  const { stats, loading, proposals, userMasogBalance } = useGovernanceData();

  return (
    <div className="space-y-8">
      <BetaBanner />
      <WelcomeSection isConnected={true} />
      <StatsSection loading={loading} stats={stats} />
      {connectedAccount && (
        <VotingPowerSection
          loading={loading}
          userMasogBalance={userMasogBalance}
          userVotingPower={userMasogBalance} // Using MASOG balance as voting power
        />
      )}
      <RecentProposalsSection loading={loading} proposals={proposals} />
      <ActionLinks />
    </div>
  );
}
