import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "@/store/useContractStore";
import { governanceKeys } from "@/react-queries/governanceKeys";

export function useTotalVotes() {
    const { governancePublic } = useContractStore();

    return useQuery({
        queryKey: governanceKeys.totalVotes(),
        queryFn: async () => {
            if (!governancePublic) {
                throw new Error("Governance contract not initialized");
            }

            try {
                return await governancePublic.getTotalNbVotes();
            } catch (error) {
                console.error("[Error] Error fetching total votes:", error);
                throw error;
            }
        },
        refetchInterval: 5000,
        retry: 3,
        retryDelay: 1000,
        enabled: !!governancePublic,
        staleTime: 15000,
    });
} 