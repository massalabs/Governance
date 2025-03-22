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

// Cache for public providers to avoid unnecessary network calls
const publicProviderCache = new Map<string, PublicProvider>();

const getPublicProvider = async (
  provider: Provider
): Promise<PublicProvider> => {
  try {
    const networkInfos = await provider.networkInfos();
    const networkKey = networkInfos.url || networkInfos.name;

    // Check if we have a cached provider for this network
    if (publicProviderCache.has(networkKey)) {
      return publicProviderCache.get(networkKey)!;
    }

    // Create a new provider
    let publicProvider: PublicProvider;
    if (!networkInfos.url) {
      publicProvider =
        networkInfos.name === "mainnet"
          ? JsonRpcProvider.mainnet()
          : JsonRpcProvider.buildnet();
    } else {
      publicProvider = JsonRpcProvider.fromRPCUrl(networkInfos.url);
    }

    // Cache the provider
    publicProviderCache.set(networkKey, publicProvider);
    return publicProvider;
  } catch (error) {
    console.error("Error getting public provider:", error);
    // Fallback to buildnet if there's an error
    const fallbackProvider = JsonRpcProvider.buildnet();
    publicProviderCache.set("buildnet", fallbackProvider);
    return fallbackProvider;
  }
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
    // Clear the provider cache when resetting contracts
    publicProviderCache.clear();
    set({
      governance: undefined,
      oracle: undefined,
      masOg: undefined,
      isInitialized: false,
    });
  },
}));
