import { create } from "zustand";
import { Provider } from "@massalabs/massa-web3";
import { Governance } from "../contract-wrapper/Governance";
import { Oracle } from "../contract-wrapper/Oracle";
import { MasOg } from "../contract-wrapper/MasOg";

interface ContractStoreState {
  governance?: Governance;
  oracle?: Oracle;
  masOg?: MasOg;
  isInitialized: boolean;
  initializeContracts: (provider: Provider) => Promise<void>;
  resetContracts: () => void;
}

export const useContractStore = create<ContractStoreState>((set) => ({
  governance: undefined,
  oracle: undefined,
  masOg: undefined,
  isInitialized: false,

  initializeContracts: async (provider: Provider) => {
    console.log("Initializing contract");
    try {
      const [governance, oracle, masOg] = await Promise.all([
        Governance.init(provider),
        Oracle.init(provider),
        MasOg.init(provider),
      ]);

      set({
        governance,
        oracle,
        masOg,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
    }
  },

  resetContracts: () => {
    set({
      governance: undefined,
      oracle: undefined,
      masOg: undefined,
      isInitialized: false,
    });
  },
}));
