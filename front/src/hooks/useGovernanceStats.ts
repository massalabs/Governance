import { useEffect, useState } from "react";
import { useContractStore } from "../store/useContractStore";
import { toast } from "@massalabs/react-ui-kit";
import { bytesToStr } from "@massalabs/massa-web3";
import { useAccountStore } from "@massalabs/react-ui-kit";

interface GovernanceStats {
  totalProposals: bigint;
  activeProposals: bigint;
  totalVotes: bigint;
  userMasogBalance: bigint;
  userVotingPower: bigint;
}

export const useGovernanceStats = () => {
  const { governance, masOg } = useContractStore();
  const { connectedAccount } = useAccountStore();
  const [stats, setStats] = useState<GovernanceStats>({
    totalProposals: 0n,
    activeProposals: 0n,
    totalVotes: 0n,
    userMasogBalance: 0n,
    userVotingPower: 0n,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!governance) return;

      try {
        setLoading(true);
        setError(null);

        // Get all proposals to calculate active ones and total votes
        const proposals = await governance.public.getProposals();
        const totalProposals = BigInt(proposals.length);
        const activeProposals = proposals.filter(
          (p) => bytesToStr(p.status) === "votingStatus"
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

        // Get user-specific stats if connected
        let userMasogBalance = 0n;
        let userVotingPower = 0n;

        if (connectedAccount && masOg) {
          userMasogBalance = await masOg.public.balanceOf(
            connectedAccount.address
          );
          // For now, voting power is equal to MASOG balance
          userVotingPower = userMasogBalance;
        }

        setStats({
          totalProposals,
          activeProposals: BigInt(activeProposals),
          totalVotes,
          userMasogBalance,
          userVotingPower,
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
  }, [governance, masOg, connectedAccount]);

  return { stats, loading, error };
};
