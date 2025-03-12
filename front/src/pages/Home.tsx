import { useGovernanceData } from "../hooks/useGovernanceData";
import { WelcomeSection } from "../components/home/WelcomeSection";
import { StatsSection } from "../components/home/StatsSection";
import { VotingPowerSection } from "../components/home/VotingPowerSection";
import { RecentProposalsSection } from "../components/home/RecentProposalsSection";
import { ActionLinks } from "../components/home/ActionLinks";

export default function Home() {
  const {
    stats,
    loading,
    proposals,
    userMasogBalance,
    userVotingPower,
    connectedAccount,
  } = useGovernanceData();

  const isConnected = !!connectedAccount;

  // If not connected, show welcome screen
  if (!isConnected) {
    return <WelcomeSection isConnected={false} />;
  }

  return (
    <div className="space-y-8">
      <WelcomeSection isConnected={true} />

      <StatsSection loading={loading} stats={stats} />

      <VotingPowerSection
        loading={loading}
        userMasogBalance={userMasogBalance}
        userVotingPower={userVotingPower}
      />

      <RecentProposalsSection loading={loading} proposals={proposals} />

      <ActionLinks />
    </div>
  );
}
