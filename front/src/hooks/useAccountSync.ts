import { useCallback, useEffect, useRef, useState } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { useLocalStorage } from "@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage";
import { getWallets } from "@massalabs/wallet-provider";
import { useQueryClient } from "@tanstack/react-query";
import { governanceKeys } from "../react-queries/governanceKeys";

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

        const wallets = await getWallets();

        const targetWallet = wallets.find((w) => w.name() === providerName);

        if (targetWallet) {
          const accounts = await targetWallet.accounts();
          const matchingAccount = accounts.find((a) => a.address === address);

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

  const connectWallet = useCallback(
    async (stored: { account: any; wallet: any }) => {
      setConnectionStatus("Setting up wallet connection...");
      // @ts-ignore Version mismatch between react-ui-kit and wallet-provider
      await setCurrentWallet(stored.wallet, stored.account);

      setConnectionStatus("Initializing contracts...");


      // Invalidate queries to trigger a fresh fetch
      queryClient.invalidateQueries({ queryKey: governanceKeys.all });
      setConnectionStatus("Connected successfully!");
    },
    [setCurrentWallet, queryClient]
  );

  const handleConnectionError = useCallback(
    (error: any) => {
      console.error("Error initializing contracts:", error);
      setConnectionStatus("Error initializing contracts");
      setSavedAccount(EMPTY_ACCOUNT);
    },
    [setSavedAccount]
  );

  const setAccountFromSaved = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    setIsConnecting(true);

    try {

      // If we have a saved account, try to restore it
      if (savedAccount.address && savedAccount.providerName) {
        setConnectionStatus("Attempting to restore saved account...");


        const stored = await getStoredAccount(
          savedAccount.address,
          savedAccount.providerName
        );

        if (stored) {
          await connectWallet(stored);
        } else {
          setConnectionStatus("No stored account found");
          setSavedAccount(EMPTY_ACCOUNT);
        }
      }
    } catch (error) {
      handleConnectionError(error);
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
    connectWallet,
    handleConnectionError,
    setSavedAccount,
  ]);

  // Effect to update saved account when connected account changes
  useEffect(() => {
    if (!connectedAccount || initializingRef.current) return;

    const shouldUpdateSavedAccount =
      connectedAccount.address !== savedAccount.address ||
      connectedAccount.providerName !== savedAccount.providerName;

    if (shouldUpdateSavedAccount) {
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

    setAccountFromSaved();
  }, [setAccountFromSaved]);

  return { setSavedAccount, isConnecting, connectionStatus };
};

export default useAccountSync;
