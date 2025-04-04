import { toast, useAccountStore } from "@massalabs/react-ui-kit";
import { useBalanceRefresh } from "./queries/useBalanceRefresh";
import { useEffect } from "react";
import { useContractStore } from "@/store/useContractStore";
import { useGovernanceData } from "./queries/useGovernanceData";
import useAccountSync from "./useAccountSync";
import { networkName } from "@/config";

export function useInitApp() {
    const { refresh } = useGovernanceData();
    const { connectedAccount, network } = useAccountStore();
    const { initializeAllContracts, initializePublicContracts } = useContractStore();
    useBalanceRefresh();
    useAccountSync();
    useEffect(() => {
        if (connectedAccount) {
            initializeAllContracts(connectedAccount)
        } else {
            initializePublicContracts()
        }

    }, [connectedAccount, refresh]);

    useEffect(() => {
        if (network) {
            if (network.name !== networkName) {
                toast.error("Please switch to the correct network")
            }
        }
    }, [network])
}
