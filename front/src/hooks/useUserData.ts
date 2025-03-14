import { useEffect } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { useGovernanceData } from "./useGovernanceData";

export function useUserData() {
  const { connectedAccount } = useAccountStore();
  const { refresh } = useGovernanceData();

  useEffect(() => {
    if (connectedAccount) {
      // Refresh all user-related data when account changes
      refresh();
    }
  }, [connectedAccount, refresh]);
}
