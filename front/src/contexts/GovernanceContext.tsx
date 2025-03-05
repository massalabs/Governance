import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { GovernanceService } from "../services/governance";
import {
  Proposal,
  Vote,
  CreateProposalParams,
  ProposalFilters,
  ProposalSort,
  GovernanceStats,
} from "../types/governance";
import {
  Account,
  JsonRpcProvider,
  Provider,
  Web3Provider,
} from "@massalabs/massa-web3";

interface GovernanceContextType {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  account: Account | null;
  votingPower: bigint;
  stats: GovernanceStats;
  connect: (account: Account) => Promise<void>;
  disconnect: () => void;
  refreshProposals: () => Promise<void>;
  createProposal: (params: CreateProposalParams) => Promise<bigint>;
  vote: (
    proposalId: bigint,
    vote: "POSITIVE" | "NEGATIVE" | "BLANK",
    comment?: string
  ) => Promise<void>;
  getVote: (proposalId: bigint, voter: string) => Promise<Vote | null>;
  getProposals: (
    filters?: ProposalFilters,
    sort?: ProposalSort
  ) => Promise<Proposal[]>;
  getProposal: (id: bigint) => Promise<Proposal | null>;
}

const GovernanceContext = createContext<GovernanceContextType | null>(null);

export function GovernanceProvider({
  children,
  provider,
}: {
  children: ReactNode;
  provider: Provider;
}) {
  const [governanceService] = useState(() => new GovernanceService(provider));
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [votingPower, setVotingPower] = useState<bigint>(BigInt(0));
  const [stats, setStats] = useState<GovernanceStats>({
    totalProposals: BigInt(0),
    activeProposals: BigInt(0),
    totalVotes: BigInt(0),
    totalMasogSupply: BigInt(0),
    userMasogBalance: BigInt(0),
    userVotingPower: BigInt(0),
  });

  const connect = async (account: Account) => {
    try {
      await governanceService.connect(account);
      setAccount(account);
      const balance = await governanceService.getUserMasogBalance();
      setVotingPower(balance);
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setVotingPower(BigInt(0));
  };

  const refreshProposals = async () => {
    try {
      setLoading(true);
      const proposals = await governanceService.getProposals();
      setProposals(proposals);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch proposals"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const stats = await governanceService.getGovernanceStats();
      setStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    }
  };

  const createProposal = async (
    params: CreateProposalParams
  ): Promise<bigint> => {
    if (!account) {
      throw new Error("Account not connected");
    }
    return governanceService.createProposal(params);
  };

  const vote = async (
    proposalId: bigint,
    vote: "POSITIVE" | "NEGATIVE" | "BLANK",
    comment?: string
  ): Promise<void> => {
    if (!account) {
      throw new Error("Account not connected");
    }
    await governanceService.vote(proposalId, vote, comment);
    await refreshProposals();
  };

  const getVote = async (
    proposalId: bigint,
    voter: string
  ): Promise<Vote | null> => {
    return governanceService.getVote(proposalId, voter);
  };

  const getProposals = async (
    filters?: ProposalFilters,
    sort?: ProposalSort
  ): Promise<Proposal[]> => {
    return governanceService.getProposals(filters, sort);
  };

  const getProposal = async (id: bigint): Promise<Proposal | null> => {
    return governanceService.getProposal(id);
  };

  useEffect(() => {
    refreshProposals();
    refreshStats();
  }, []);

  return (
    <GovernanceContext.Provider
      value={{
        proposals,
        loading,
        error,
        account,
        votingPower,
        stats,
        connect,
        disconnect,
        refreshProposals,
        createProposal,
        vote,
        getVote,
        getProposals,
        getProposal,
      }}
    >
      {children}
    </GovernanceContext.Provider>
  );
}

export function useGovernance() {
  const context = useContext(GovernanceContext);
  if (!context) {
    throw new Error("useGovernance must be used within a GovernanceProvider");
  }
  return context;
}
