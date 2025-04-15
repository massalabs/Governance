import { create } from "zustand";
import {
  JsonRpcProvider,
  Provider,
  PublicProvider,
} from "@massalabs/massa-web3";
import { Governance } from "../contract-wrapper/Governance";
import { MasOg } from "../contract-wrapper/MasOg";
import { Oracle } from "../contract-wrapper/Oracle";
import { isMainnet } from "@/config";

interface Contracts {
  governancePublic: Governance;
  governancePrivate: Governance;
  masOgPublic: MasOg;
  masOgPrivate: MasOg;
  oraclePublic: Oracle;
  oraclePrivate: Oracle;
}

interface ContractStoreState extends Partial<Contracts> {
  isInitialized: boolean;
  initializePublicContracts: (provider?: Provider) => Promise<void>;
  initializePrivateContracts: (provider: Provider) => Promise<void>;
  initializeAllContracts: (provider: Provider) => Promise<void>;
  resetContracts: () => void;
}

const getPublicProvider = async (): Promise<PublicProvider> => {
  return isMainnet ? await JsonRpcProvider.mainnet() : await JsonRpcProvider.buildnet();
};

export const useContractStore = create<ContractStoreState>((set) => ({
  isInitialized: false,

  initializePublicContracts: async (provider?: Provider) => {
    try {
      const [governancePublic, masOgPublic, oraclePublic] = await Promise.all([
        Governance.initPublic(provider ?? await getPublicProvider()),
        MasOg.initPublic(provider ?? await getPublicProvider()),
        Oracle.initPublic(provider ?? await getPublicProvider()),
      ]);

      set((state) => ({
        ...state,
        governancePublic,
        masOgPublic,
        oraclePublic,
      }));
    } catch (error) {
      console.error("Failed to initialize public contracts:", error);
      throw error;
    }
  },

  initializePrivateContracts: async (provider: Provider) => {
    try {
      const [governancePrivate, masOgPrivate, oraclePrivate] = await Promise.all([
        Governance.init(provider),
        MasOg.init(provider),
        Oracle.init(provider),
      ]);

      set((state) => ({
        ...state,
        governancePrivate,
        masOgPrivate,
        oraclePrivate,
      }));
    } catch (error) {
      console.error("Failed to initialize private contracts:", error);
      throw error;
    }
  },

  initializeAllContracts: async (provider: Provider) => {
    try {
      await Promise.all([
        useContractStore.getState().initializePublicContracts(provider),
        useContractStore.getState().initializePrivateContracts(provider),
      ]);

      set({ isInitialized: true });
    } catch (error) {
      console.error("Failed to initialize all contracts:", error);
      throw error;
    }
  },

  resetContracts: () => {
    set({
      governancePublic: undefined,
      governancePrivate: undefined,
      masOgPublic: undefined,
      masOgPrivate: undefined,
      oraclePublic: undefined,
      oraclePrivate: undefined,
      isInitialized: false,
    });
  },
}));
