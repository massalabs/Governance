import { useEffect } from "react";
import {
  useAccountStore as useUIKitAccountStore,
  toast,
} from "@massalabs/react-ui-kit";
import { useContractStore } from "../store/useContractStore";

export const useContractInitialization = () => {
  const {
    connectedAccount,
    currentWallet,
    network: walletNetwork,
  } = useUIKitAccountStore();
  const { initializeContracts, resetContracts, isInitialized } =
    useContractStore();

  // Initialize or reset contracts based on wallet connection
  useEffect(() => {
    console.log("[Debug] Contract initialization effect triggered:", {
      hasConnectedAccount: !!connectedAccount,
      hasWalletNetwork: !!walletNetwork,
      isInitialized,
    });

    if (!connectedAccount) {
      console.log("[Debug] No connected account, resetting contracts");
      resetContracts();
      return;
    }

    if (connectedAccount && walletNetwork) {
      // Add network validation here if needed
      // if (walletNetwork.name !== expectedNetwork) {
      //   console.error(`Please switch your wallet to ${expectedNetwork} network`);
      //   return;
      // }

      if (!isInitialized) {
        console.log("[Debug] Initializing contracts...");
        try {
          // @ts-ignore TODO: fix this version related issue
          initializeContracts(connectedAccount)
            .then(() => {
              console.log("[Debug] Contracts initialized successfully");
            })
            .catch((error) => {
              console.error("[Debug] Contract initialization failed:", error);
            });
        } catch (error) {
          console.error("[Debug] Failed to initialize contracts:", error);
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
      console.log("[Debug] Cleaning up contracts");
      resetContracts();
    };
  }, [resetContracts]);
};
