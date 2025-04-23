import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "@/store/useContractStore";
import { Mas, OperationStatus } from "@massalabs/massa-web3";
import { toast } from "@massalabs/react-ui-kit";

export const useRefreshMutation = () => {
    const queryClient = useQueryClient();
    const { governancePrivate } = useContractStore();

    return useMutation({
        mutationFn: async () => {
            if (!governancePrivate) {
                throw new Error("Governance contract not available");
            }

            const op = await governancePrivate.refresh({
                coins: Mas.fromString("0.01"),
            });
            const status = await op.waitFinalExecution();

            if (status !== OperationStatus.Success) {
                throw new Error(`Failed to refresh proposals: ${status}`);
            }

            return status;
        },
        onSuccess: () => {
            toast.success("Proposals refreshed successfully!");
            queryClient.invalidateQueries({ queryKey: ["adminData"] });
        },
        onError: (error) => {
            console.error("Error refreshing proposals:", error);
            toast.error(`Failed to refresh proposals: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}; 