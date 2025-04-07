import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProposalParams } from "../../types/governance";
import { Proposal } from "../../serializable/Proposal";
import {
  useAccountStore,
  useWriteSmartContract,
} from "@massalabs/react-ui-kit";
import { Args, Mas } from "@massalabs/massa-web3";
import { useContractStore } from "@/store/useContractStore";
import { useNavigate } from "react-router-dom";
import { useGovernanceData } from "./useGovernanceData";
import { governanceKeys } from "../queryKeys/governance";
import { MIN_PROPOSAL_MAS_AMOUNT, MIN_PROPOSAL_MASOG_AMOUNT } from "@/config";

export const REQUIRED_MASOG = MIN_PROPOSAL_MASOG_AMOUNT
export const REQUIRED_MAS = MIN_PROPOSAL_MAS_AMOUNT + Mas.fromMas(1n);

export interface ValidationErrors {
  title?: string;
  forumPostLink?: string;
  summary?: string;
  parameterChange?: string;
}

export function validateForm(
  formData: CreateProposalParams,
  parameterChangeInput: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formData.title.trim()) {
    errors.title = "Title is required";
  }
  if (!formData.summary.trim()) {
    errors.summary = "Summary is required";
  }
  if (parameterChangeInput) {
    try {
      JSON.parse(parameterChangeInput);
    } catch {
      errors.parameterChange = "Invalid JSON format";
    }
  }

  return errors;
}

export function hasEnoughMasog(
  userMasogBalance: bigint | null | undefined
): boolean {
  return !!userMasogBalance && userMasogBalance >= REQUIRED_MASOG;
}

export function hasEnoughMas(userMasBalance: bigint | undefined): boolean {
  return !!userMasBalance && userMasBalance >= REQUIRED_MAS;
}

export function useCreateProposalMutation() {
  const navigate = useNavigate();
  const { connectedAccount, balance: userMasBalance } = useAccountStore();
  const { governancePrivate } = useContractStore();
  const { refresh, userMasogBalance } = useGovernanceData();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      parameterChangeInput,
    }: {
      formData: CreateProposalParams;
      parameterChangeInput: string;
    }) => {
      if (!governancePrivate) {
        throw new Error("Governance contract not initialized");
      }

      if (!hasEnoughMasog(userMasogBalance)) {
        throw new Error("Not enough MASOG balance");
      }

      if (!hasEnoughMas(userMasBalance)) {
        throw new Error("Not enough MAS balance");
      }

      const errors = validateForm(formData, parameterChangeInput);
      if (Object.keys(errors).length > 0) {
        throw new Error("Validation failed");
      }

      const proposal = Proposal.create(
        formData.title.trim(),
        formData.forumPostLink.trim(),
        formData.summary.trim(),
        // TODO: default should be null
        parameterChangeInput || "{}"
      );

      await callSmartContract(
        "submitUpdateProposal",
        governancePrivate.address,
        new Args().addSerializable(proposal).serialize(),
        {
          success: "Proposal created successfully!",
          pending: "Creating proposal...",
          error: "Failed to create proposal",
        },
        REQUIRED_MAS,
        undefined,
        true
      );

      await refresh();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.all });
      navigate(`/proposals`);
    },
  });
}
