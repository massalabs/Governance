import { useState } from "react";
import { CreateProposalParams } from "../types/governance";
import { Proposal } from "../serializable/Proposal";
import {
  useAccountStore,
  useWriteSmartContract,
} from "@massalabs/react-ui-kit";
import { Args, Mas } from "@massalabs/massa-web3";
import { useContractStore } from "@/store/useContractStore";

export const REQUIRED_MASOG = 1n;

interface ValidationErrors {
  title?: string;
  forumPostLink?: string;
  summary?: string;
  parameterChange?: string;
}

export function useCreateProposal() {
  const [formData, setFormData] = useState<CreateProposalParams>({
    title: "",
    forumPostLink: "",
    summary: "",
    parameterChange: undefined,
  });
  const [parameterChangeInput, setParameterChangeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { connectedAccount } = useAccountStore();
  const { governance } = useContractStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);
  const userMasogBalance = 2000n; // TODO: Replace with actual balance from contract
  const hasEnoughMasog = userMasogBalance >= REQUIRED_MASOG;

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.summary.trim()) {
      newErrors.summary = "Summary is required";
    }
    if (parameterChangeInput) {
      try {
        JSON.parse(parameterChangeInput);
      } catch {
        newErrors.parameterChange = "Invalid JSON format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(parameterChangeInput);
      setParameterChangeInput(JSON.stringify(parsed, null, 2));
      setErrors((prev) => ({ ...prev, parameterChange: undefined }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        parameterChange: "Invalid JSON format",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!governance?.private || !validateForm()) return;

    setLoading(true);
    try {
      const proposal = Proposal.create(
        formData.title.trim(),
        formData.forumPostLink.trim(),
        formData.summary.trim(),
        parameterChangeInput || "{}"
      );

      await callSmartContract(
        "submitUpdateProposal",
        governance.private.address,
        new Args().addSerializable(proposal).serialize(),
        {
          success: "Proposal created successfully!",
          pending: "Creating proposal...",
          error: "Failed to create proposal",
        },
        Mas.fromString("1001")
      );
    } catch (error) {
      console.error("Failed to create proposal:", error);
      throw error;
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
    errors,
    handleSubmit,
    formatJson,
    userMasogBalance,
    hasEnoughMasog,
  };
}
