import { useState } from "react";
import { CreateProposalParams } from "../types/governance";
import { Proposal } from "../serializable/Proposal";
import {
  useAccountStore,
  useWriteSmartContract,
} from "@massalabs/react-ui-kit";

export const REQUIRED_MASOG = 1000n;

export function useCreateProposal() {
  const [formData, setFormData] = useState<CreateProposalParams>({
    title: "",
    forumPostLink: "",
    summary: "",
  });
  const [parameterChangeInput, setParameterChangeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { connectedAccount } = useAccountStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);

  // Mock values for now - these should be fetched from your wallet/chain
  const userMasogBalance = 2000n;
  const hasEnoughMasog = userMasogBalance >= REQUIRED_MASOG;

  const formatJson = () => {
    try {
      const parsed = JSON.parse(parameterChangeInput);
      setParameterChangeInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // If invalid JSON, leave as is
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughMasog) return;

    setLoading(true);
    try {
      // Create proposal with correct field order
      const proposal = Proposal.create(
        formData.title,
        formData.forumPostLink,
        formData.summary,
        parameterChangeInput || "{}"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    parameterChangeInput,
    setParameterChangeInput,
    loading,
    hasEnoughMasog,
    userMasogBalance,
    handleSubmit,
    formatJson,
  };
}
