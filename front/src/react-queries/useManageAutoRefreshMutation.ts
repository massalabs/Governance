import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "@/store/useContractStore";
import { OperationStatus } from "@massalabs/massa-web3";
import { toast } from "@massalabs/react-ui-kit";
import { ManageAutoRefresh } from "@/serializable/ManageAutoRefresh";
interface AutoRefreshParams {
    enabled: boolean;
    maxGas: string;
    maxFee: string;
}

export const useManageAutoRefreshMutation = () => {
    const queryClient = useQueryClient();
    const { governancePrivate } = useContractStore();

    return useMutation({
        mutationFn: async ({ enabled, maxGas, maxFee }: AutoRefreshParams) => {
            if (!governancePrivate) {
                throw new Error("Governance contract not available");
            }

            // Convert string values to bigint
            const maxGasValue = BigInt(maxGas);
            const maxFeeValue = BigInt(maxFee);

            // Call the manageAutoRefresh method
            const op = await governancePrivate.manageAutoRefresh(
                new ManageAutoRefresh(enabled, maxGasValue, maxFeeValue)
            );

            // Wait for the operation to be confirmed
            const status = await op.waitFinalExecution();

            if (status !== OperationStatus.Success) {
                throw new Error(`Failed to update auto-refresh settings: ${status}`);
            }

            return status;
        },
        onSuccess: () => {
            toast.success("Auto-refresh settings updated successfully!");
            // Invalidate the admin data query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ["adminData"] });
        },
        onError: (error) => {
            console.error("Error managing auto-refresh:", error);
            toast.error(`Failed to manage auto-refresh: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}; 