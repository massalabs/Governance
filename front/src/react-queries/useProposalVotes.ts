import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "@/store/useContractStore";
import { governanceKeys } from "@/react-queries/governanceKeys";
import { VoteDetails, FormattedProposal } from "@/types/governance";

export function useProposalVotes(proposals: FormattedProposal[]) {
    const { governancePublic } = useContractStore();

    return useQuery({
        queryKey: governanceKeys.allProposalVotes(),
        queryFn: async () => {
            if (!governancePublic || !proposals.length) {
                throw new Error("Missing dependencies for fetching proposal votes");
            }

            try {
                const votesMap: Record<string, VoteDetails[]> = {};

                for (const proposal of proposals) {

                    const votes = await governancePublic.getVotesPower(proposal.id);

                    votesMap[proposal.id.toString()] = votes;
                }

                return votesMap;
            } catch (error) {
                console.error("[Error] Error fetching proposal votes:", error);
                throw error;
            }
        },
        refetchInterval: 10000,
        retry: 3,
        retryDelay: 1000,
        enabled: !!governancePublic && proposals.length > 0,
    });
}

// Add a new hook for fetching votes for a single proposal
export function useSingleProposalVotes(proposalId: bigint) {
    const { governancePublic } = useContractStore();

    return useQuery({
        queryKey: governanceKeys.proposalVotes(proposalId),
        queryFn: async () => {
            if (!governancePublic) {
                throw new Error("Governance contract not initialized");
            }
            try {
                const votes = await governancePublic.getVotesPower(proposalId);
                return votes;
            } catch (error) {
                console.error("[Error] Error fetching proposal votes:", error);
                throw error;
            }
        },
        refetchInterval: 10000,
        retry: 3,
        retryDelay: 1000,
        enabled: !!governancePublic,
    });
} 