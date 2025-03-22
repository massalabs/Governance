import { useCallback, useEffect, useRef, useState } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { useLocalStorage } from "@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage";
import { getWallets } from "@massalabs/wallet-provider";
import { useContractStore } from "../store/useContractStore";
import { useQueryClient } from "@tanstack/react-query";
import { governanceKeys } from "./useGovernanceData";

type SavedAccount = {
  address: string;
  providerName: string;
};

const EMPTY_ACCOUNT: SavedAccount = {
  address: "",
  providerName: "",
};

const useAccountSync = () => {
  const { connectedAccount, setCurrentWallet } = useAccountStore();
  const { initializeContracts } = useContractStore();
  const queryClient = useQueryClient();
  const initializingRef = useRef(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");

  const [savedAccount, setSavedAccount] = useLocalStorage<SavedAccount>(
    "saved-account",
    EMPTY_ACCOUNT
  );

  const getStoredAccount = useCallback(
    async (address: string, providerName: string) => {
      try {
        console.log("Getting stored account for:", address, providerName);
        const wallets = await getWallets();

        const targetWallet = wallets.find((w) => w.name() === providerName);
        console.log("Found target wallet:", targetWallet?.name());

        if (targetWallet) {
          const accounts = await targetWallet.accounts();
          const matchingAccount = accounts.find((a) => a.address === address);
          console.log("Found matching account:", matchingAccount?.address);

          if (matchingAccount) {
            return { account: matchingAccount, wallet: targetWallet, wallets };
          }
        }
        return null;
      } catch (error) {
        console.error("Error getting stored account:", error);
        return null;
      }
    },
    []
  );

  const setAccountFromSaved = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    setIsConnecting(true);

    try {
      console.log("Setting account from saved:", savedAccount);

      // If we have a saved account, try to restore it
      if (savedAccount.address && savedAccount.providerName) {
        setConnectionStatus("Attempting to restore saved account...");
        console.log("Attempting to restore saved account");
        const stored = await getStoredAccount(
          savedAccount.address,
          savedAccount.providerName
        );
        if (stored) {
          try {
            setConnectionStatus("Setting up wallet connection...");
            console.log("Found stored account, setting current wallet");
            // @ts-ignore Version mismatch between react-ui-kit and wallet-provider
            await setCurrentWallet(stored.wallet, stored.account);
            setConnectionStatus("Initializing contracts...");
            console.log("Initializing contracts");
            await initializeContracts(stored.account);
            // Invalidate queries to trigger a fresh fetch
            queryClient.invalidateQueries({ queryKey: governanceKeys.all });
            setConnectionStatus("Connected successfully!");
          } catch (error) {
            console.error("Error initializing contracts:", error);
            setConnectionStatus("Error initializing contracts");
            setSavedAccount(EMPTY_ACCOUNT);
          }
        } else {
          console.log("No stored account found, clearing saved account");
          setConnectionStatus("No stored account found");
          setSavedAccount(EMPTY_ACCOUNT);
        }
      }
    } finally {
      setTimeout(() => {
        initializingRef.current = false;
        setIsConnecting(false);
        setConnectionStatus("");
      }, 1500); // Give user time to see the final status
    }
  }, [
    savedAccount,
    getStoredAccount,
    setCurrentWallet,
    initializeContracts,
    queryClient,
    setSavedAccount,
  ]);

  // Effect to update saved account when connected account changes
  useEffect(() => {
    if (!connectedAccount || initializingRef.current) return;

    const shouldUpdateSavedAccount =
      connectedAccount.address !== savedAccount.address ||
      connectedAccount.providerName !== savedAccount.providerName;

    if (shouldUpdateSavedAccount) {
      console.log("Updating saved account to:", connectedAccount.address);
      setSavedAccount({
        address: connectedAccount.address,
        providerName: connectedAccount.providerName,
      });
    }
  }, [connectedAccount, savedAccount, setSavedAccount]);

  // Effect to initialize account on mount
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    console.log("Running initial account initialization");
    setAccountFromSaved();
  }, [setAccountFromSaved]);

  return { setSavedAccount, isConnecting, connectionStatus };
};

export default useAccountSync;
