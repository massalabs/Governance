import { useState } from "react";
import { CreateProposalParams } from "../types/governance";

export const REQUIRED_MASOG = 1000n;

export function useCreateProposal() {
  const [formData, setFormData] = useState<CreateProposalParams>({
    title: "",
    forumPostLink: "",
    summary: "",
  });
  const [parameterChangeInput, setParameterChangeInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Implementation for submitting proposal would go here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
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
