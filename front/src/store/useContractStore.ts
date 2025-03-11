import { create } from "zustand";
import {
  JsonRpcProvider,
  Provider,
  PublicProvider,
} from "@massalabs/massa-web3";
import { Governance } from "../contract-wrapper/Governance";
import { Oracle } from "../contract-wrapper/Oracle";
import { MasOg } from "../contract-wrapper/MasOg";

export interface ContractPair<T> {
  private: T;
  public: T;
}

interface Contracts {
  governance: ContractPair<Governance>;
  oracle: ContractPair<Oracle>;
  masOg: ContractPair<MasOg>;
}

interface ContractStoreState extends Partial<Contracts> {
  isInitialized: boolean;
  initializeContracts: (provider: Provider) => Promise<void>;
  resetContracts: () => void;
}

const getPublicProvider = async (
  provider: Provider
): Promise<PublicProvider> => {
  const networkInfos = await provider.networkInfos();

  if (!networkInfos.url) {
    return networkInfos.name === "mainnet"
      ? JsonRpcProvider.mainnet()
      : JsonRpcProvider.buildnet();
  }

  return JsonRpcProvider.fromRPCUrl(networkInfos.url);
};

const initializeContractPair = async <T>(
  ContractClass: {
    init: (provider: Provider) => Promise<T>;
    initPublic: (provider: PublicProvider) => Promise<T>;
  },
  provider: Provider,
  publicProvider: PublicProvider
): Promise<ContractPair<T>> => {
  const [private_, public_] = await Promise.all([
    ContractClass.init(provider),
    ContractClass.initPublic(publicProvider),
  ]);

  return { private: private_, public: public_ };
};

export const useContractStore = create<ContractStoreState>((set) => ({
  isInitialized: false,

  initializeContracts: async (provider: Provider) => {
    try {
      const publicProvider = await getPublicProvider(provider);

      const [governance, oracle, masOg] = await Promise.all([
        initializeContractPair(Governance, provider, publicProvider),
        initializeContractPair(Oracle, provider, publicProvider),
        initializeContractPair(MasOg, provider, publicProvider),
      ]);

      set({
        governance,
        oracle,
        masOg,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
      throw error; // Re-throw to allow error handling by caller
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
