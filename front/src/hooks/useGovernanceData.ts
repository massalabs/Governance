import { useEffect } from "react";
import { useGovernanceStore } from "../store/useGovernanceStore";
import { useAccountStore } from "@massalabs/react-ui-kit";

export function useGovernanceData() {
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
      const fetchData = async () => {
        await Promise.all([fetchProposals(), fetchStats(), fetchUserBalance()]);
      };
      fetchData();
    }
  }, [connectedAccount, fetchProposals, fetchStats, fetchUserBalance]);

  return {
    stats,
    loading,
    proposals,
    userMasogBalance,
    userVotingPower,
    connectedAccount,
  };
}
