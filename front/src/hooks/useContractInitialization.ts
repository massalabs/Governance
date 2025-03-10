import { useEffect } from "react";
import {
  useAccountStore as useUIKitAccountStore,
  toast,
} from "@massalabs/react-ui-kit";
import { useContractStore } from "../store/contractStore";
import useAccountSync from "./useAccountSync";

export const useContractInitialization = () => {
  const {
    connectedAccount,
    currentWallet,
    network: walletNetwork,
  } = useUIKitAccountStore();
  const { initializeContracts, resetContracts, isInitialized } =
    useContractStore();

  // Initialize account sync
  useAccountSync();

  // Initialize or reset contracts based on wallet connection
  useEffect(() => {
    if (!connectedAccount) {
      resetContracts();
      return;
    }

    if (connectedAccount && walletNetwork) {
      // You can add network validation here if needed
      // if (walletNetwork.name !== expectedNetwork) {
      //   toast.error(`Please switch your wallet to ${expectedNetwork} network`);
      //   return;
      // }

      if (!isInitialized) {
        try {
          // @ts-ignore TODO: fix this version related issue

          initializeContracts(connectedAccount);
        } catch (error) {
          console.error("Failed to initialize contracts:", error);
          toast.error(
            "Failed to initialize contracts. Please try reconnecting your wallet."
          );
        }
      }
    }
  }, [
    connectedAccount,
    walletNetwork,
    currentWallet,
    isInitialized,
    initializeContracts,
    resetContracts,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetContracts();
    };
  }, [resetContracts]);
};
