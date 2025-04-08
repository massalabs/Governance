import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { Mas } from "@massalabs/massa-web3";
import { toast } from "@massalabs/react-ui-kit";

interface SendCoinsParams {
    contractType: 'governance' | 'masOg';
    amount: string;
}

export const useSendCoinsMutation = () => {
    const queryClient = useQueryClient();
    const { governancePublic, masOgPublic } = useContractStore();
    const { connectedAccount } = useAccountStore();

    return useMutation({
        mutationFn: async ({ contractType, amount }: SendCoinsParams) => {
            if (!connectedAccount || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                throw new Error("Please enter a valid amount");
            }

            if (!governancePublic || !masOgPublic) {
                throw new Error("Contracts not available");
            }

            const amountInMas = Mas.fromMas(BigInt(amount));
            const contract = contractType === 'governance' ? governancePublic : masOgPublic;

            // Use the connectedAccount to send the transaction
            const op = await connectedAccount.transfer(contract.address, amountInMas);
            await op.waitSpeculativeExecution();

            return op.id;
        },
        onSuccess: (operationId) => {
            toast.success(`Transaction sent successfully! Transaction ID: ${operationId}`);
            // Invalidate the admin data query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ["adminData"] });
        },
        onError: (error) => {
            console.error("Error sending coins:", error);
            toast.error(`Failed to send coins: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}; 