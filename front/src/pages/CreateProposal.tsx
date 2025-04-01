import {
  useCreateProposalMutation,
  validateForm,
  formatJson,
  hasEnoughMasog,
  hasEnoughMas,
  type ValidationErrors,
} from "../hooks/useCreateProposalMutation";
import { MasogBalanceAlert } from "../components/create-proposal/MasogBalanceAlert";
import { BasicInformationSection } from "../components/create-proposal/BasicInformationSection";
import { TechnicalDetailsSection } from "../components/create-proposal/TechnicalDetailsSection";
import { SubmitSection } from "../components/create-proposal/SubmitSection";
import { useState } from "react";
import { CreateProposalParams } from "../types/governance";
import { useGovernanceData } from "../hooks/useGovernanceData";
import { useAccountStore } from "@massalabs/react-ui-kit";

export default function CreateProposal() {
  const [formData, setFormData] = useState<CreateProposalParams>({
    title: "",
    forumPostLink: "",
    summary: "",
    parameterChange: undefined,
  });
  const [parameterChangeInput, setParameterChangeInput] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { mutate: createProposal, isPending } = useCreateProposalMutation();
  const { userMasogBalance } = useGovernanceData();
  const { balance: userMasBalance } = useAccountStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, parameterChangeInput);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    createProposal(
      { formData, parameterChangeInput },
      {
        onError: (error) => {
          console.error("Failed to create proposal:", error);
        },
      }
    );
  };

  const handleFormatJson = () => {
    const result = formatJson(parameterChangeInput);
    setParameterChangeInput(result.formatted);
    if (result.error) {
      setErrors((prev: ValidationErrors) => ({
        ...prev,
        parameterChange: result.error,
      }));
    } else {
      setErrors((prev: ValidationErrors) => ({
        ...prev,
        parameterChange: undefined,
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
          Create New Proposal
        </h1>
        <p className="text-f-tertiary dark:text-darkMuted mas-body text-lg max-w-2xl mx-auto">
          Submit a new governance proposal to improve Massa. Make sure to
          include a detailed forum post for discussion.
        </p>
      </div>

      <MasogBalanceAlert
        hasEnoughMasog={hasEnoughMasog(userMasogBalance)}
        userMasogBalance={userMasogBalance}
        hasEnoughMas={hasEnoughMas(userMasBalance)}
        userMasBalance={userMasBalance}
      />

      <div className="bg-secondary/40 dark:bg-darkCard/40 backdrop-blur-sm border border-primary/10 dark:border-darkAccent/10 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          <BasicInformationSection
            formData={formData}
            setFormData={setFormData}
          />

          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-darkAccent/20 to-transparent" />

          <TechnicalDetailsSection
            parameterChangeInput={parameterChangeInput}
            setParameterChangeInput={setParameterChangeInput}
            error={errors.parameterChange}
            onFormatJson={handleFormatJson}
          />

          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-darkAccent/20 to-transparent" />

          <SubmitSection
            loading={isPending}
            hasEnoughMasog={hasEnoughMasog(userMasogBalance)}
          />
        </form>
      </div>
    </div>
  );
}
