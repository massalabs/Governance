import { useCallback, useEffect, useRef } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { useLocalStorage } from "@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage";
import { getWallets } from "@massalabs/wallet-provider";

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

  const setAccountFromSaved = useCallback(async () => {
    if (!savedAccount.address || !savedAccount.providerName) return;

    const stored = await getStoredAccount(
      savedAccount.address,
      savedAccount.providerName
    );
    if (stored) {
      // @ts-ignore Version mismatch between react-ui-kit and wallet-provider
      await setCurrentWallet(stored.wallet, stored.account);
    }
  }, [savedAccount, getStoredAccount, setCurrentWallet]);

  useEffect(() => {
    const shouldUpdateSavedAccount =
      connectedAccount && connectedAccount.address !== savedAccount.address;

    if (shouldUpdateSavedAccount) {
      const { address, providerName } = connectedAccount;
      setSavedAccount({ address, providerName });
    }
  }, [connectedAccount, setSavedAccount, savedAccount.address]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setAccountFromSaved();
    }
  }, [setAccountFromSaved]);

  return { setSavedAccount };
};

export default useAccountSync;
