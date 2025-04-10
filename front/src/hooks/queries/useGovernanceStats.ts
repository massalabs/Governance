import { useMemo } from "react";
import { calculateStats } from "../../utils/governance";
import { useMasogTotalSupply } from "./useMasogData";
import { useUserBalance } from "./useUserBalance";
import { useTotalVotes } from "./useTotalVotes";
import { FormattedProposal } from "../../types/governance";

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