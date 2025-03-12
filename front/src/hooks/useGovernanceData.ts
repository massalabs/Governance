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
    fetchPublicData,
    fetchUserData,
  } = useGovernanceStore();
  const { connectedAccount } = useAccountStore();

  useEffect(() => {
    const fetchData = async () => {
      await fetchPublicData();
      if (connectedAccount) {
        await fetchUserData();
      }
    };
    fetchData();
  }, [connectedAccount, fetchPublicData, fetchUserData]);

  return {
    stats,
    loading,
    proposals,
    userMasogBalance,
    userVotingPower,
    connectedAccount,
  };
}
