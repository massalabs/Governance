import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";
import {
  useAccountStore,
  useWriteSmartContract,
} from "@massalabs/react-ui-kit";
import { governanceKeys } from "./governanceKeys";
import { Vote } from "../../serializable/Vote";
import { VoteMutationParams } from "../../types/governance";
import { Args, Mas } from "@massalabs/massa-web3";

export const useVoteMutation = () => {
  const { governancePrivate } = useContractStore();
  const { connectedAccount } = useAccountStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, voteValue }: VoteMutationParams) => {
      if (!governancePrivate || !connectedAccount) {
        throw new Error("Governance contract not initialized or no account");
      }

      const vote = new Vote(proposalId, voteValue);

      await callSmartContract(
        "vote",
        governancePrivate.address,
        new Args().addSerializable(vote).serialize(),
        {
          success: "Vote submitted successfully!",
          pending: "Submitting vote...",
          error: "Failed to submit vote",
        },
        Mas.fromString("1")
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.all });
    },
  });
};
