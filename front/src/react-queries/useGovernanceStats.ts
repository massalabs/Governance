import { useMemo } from "react";
import { calculateStats } from "@/utils/governance";
import { useMasogTotalSupply } from "@/react-queries/useMasogData";
import { useUserBalance } from "@/react-queries/useUserBalance";
import { useTotalVotes } from "@/react-queries/useTotalVotes";
import { FormattedProposal } from "@/types/governance";

export function useGovernanceStats(proposals: FormattedProposal[]) {
    const { data: totalSupply } = useMasogTotalSupply();
    const { data: userMasogBalance } = useUserBalance();
    const { data: totalVotes = 0n } = useTotalVotes();

    const stats = useMemo(() => {
        return calculateStats(
            proposals,
            totalSupply ?? null,
            userMasogBalance,
            totalVotes
        );
    }, [proposals, totalSupply, userMasogBalance, totalVotes]);

    return stats;
} 