import { useEffect, useState } from "react";
import { useContractStore } from "../store/contractStore";
import { toast } from "@massalabs/react-ui-kit";

interface GovernanceStats {
  totalProposals: bigint;
  activeProposals: bigint;
  totalVotes: bigint;
}

export const useGovernanceStats = () => {
  const { governance } = useContractStore();
  const [stats, setStats] = useState<GovernanceStats>({
    totalProposals: 0n,
    activeProposals: 0n,
    totalVotes: 0n,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!governance) return;

      try {
        setLoading(true);
        setError(null);

        // Get total proposals from counter
        const totalProposals = await governance.getCounter();

        // Get all proposals to calculate active ones and total votes
        const proposals = await governance.getProposals();
        const activeProposals = proposals.filter(
          (p) => p.status === "votingStatus"
        ).length;

        // Calculate total votes
        const totalVotes = proposals.reduce(
          (acc, p) =>
            acc +
            p.positiveVoteVolume +
            p.negativeVoteVolume +
            p.blankVoteVolume,
          0n
        );

        setStats({
          totalProposals,
          activeProposals: BigInt(activeProposals),
          totalVotes,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch governance stats";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [governance]);

  return { stats, loading, error };
};
