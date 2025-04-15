import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";
import { Mas } from "@massalabs/massa-web3";
import { toast } from "@massalabs/react-ui-kit";

interface SendCoinsParams {
    contractType: 'governance' | 'masOg' | 'oracle';
    amount: string;
}

export const useSendCoinsMutation = () => {
    const queryClient = useQueryClient();
    const { governancePrivate, masOgPrivate, oraclePrivate } = useContractStore();

    return useMutation({
        mutationFn: async ({ contractType, amount }: SendCoinsParams) => {
            if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                throw new Error("Please enter a valid amount");
            }

            if (!governancePrivate || !masOgPrivate || !oraclePrivate) {
                throw new Error("Contracts not available");
            }

            const amountInNanoMas = Mas.fromMas(BigInt(amount));
            const contract = contractType === 'governance' ? governancePrivate :
                contractType === 'masOg' ? masOgPrivate :
                    oraclePrivate;

            const op = await contract.receiveCoins(amountInNanoMas);
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