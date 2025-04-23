import { toast, useAccountStore } from "@massalabs/react-ui-kit";
import { useBalanceRefresh } from "../react-queries/useBalanceRefresh";
import { useEffect } from "react";
import { useContractStore } from "@/store/useContractStore";
import useAccountSync from "./useAccountSync";
import { networkName } from "@/config";

export function useInitApp() {
    const { connectedAccount, network } = useAccountStore();
    const { initializePrivateContracts, initializePublicContracts } = useContractStore();

    useBalanceRefresh();
    useAccountSync();

    useEffect(() => {
        if (connectedAccount) {
            // @ts-ignore - TODO: Update massa-web3 in ui-kit to use the new version
            initializePrivateContracts(connectedAccount)
        } else {
            initializePublicContracts()
        }

    }, [connectedAccount, initializePrivateContracts, initializePublicContracts]);

    useEffect(() => {
        if (network) {
            if (network.name !== networkName) {
                toast.error("Please switch to the correct network")
            }
        }
    }, [network])
}
