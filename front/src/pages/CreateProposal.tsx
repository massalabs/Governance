import {
  useCreateProposalMutation,
  validateForm,
  hasEnoughMasog,
  hasEnoughMas,
  type ValidationErrors,
} from "../hooks/queries/useCreateProposalMutation";
import { MasogBalanceAlert } from "../components/create-proposal/MasogBalanceAlert";
import { BasicInformationSection } from "../components/create-proposal/BasicInformationSection";
import { TechnicalDetailsSection } from "../components/create-proposal/TechnicalDetailsSection";
import { SubmitSection } from "../components/create-proposal/SubmitSection";
import { useState } from "react";
import { CreateProposalParams } from "../types/governance";
import { useGovernanceData } from "../hooks/queries/useGovernanceData";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { ConnectButton } from "@/components/connect-wallet-popup";

export default function CreateProposal() {
  const { connectedAccount } = useAccountStore();
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

  if (!connectedAccount) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="relative overflow-hidden bg-secondary/40 dark:bg-darkCard/40 backdrop-blur-sm border border-primary/10 dark:border-darkAccent/10 rounded-2xl shadow-lg p-8">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-darkAccent/5" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 dark:bg-darkAccent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 dark:bg-darkAccent/10 rounded-full blur-3xl" />

          <div className="relative space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-f-primary dark:text-darkText">
                Connect Your Wallet
              </h2>
              <p className="text-f-tertiary dark:text-darkMuted mas-body text-lg">
                To create a new governance proposal, please connect your wallet first
              </p>
            </div>

            <div className="flex justify-center">
              <div className="transform transition-all duration-300 hover:scale-105">
                <ConnectButton />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-f-tertiary dark:text-darkMuted">
                You'll need MASOG tokens to create a proposal
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
          Create New Proposal
        </h1>
        <p className="text-f-tertiary dark:text-darkMuted mas-body text-lg max-w-2xl mx-auto">
          Submit a new governance proposal to improve Massa Blockchain. Make sure to
          include a detailed forum post for discussion.
        </p>
      </div>

      <MasogBalanceAlert
        hasEnoughMasog={hasEnoughMasog(userMasogBalance)}
        userMasogBalance={userMasogBalance}
        hasEnoughMas={hasEnoughMas(userMasBalance)}
        userMasBalance={userMasBalance}
      />

      {hasEnoughMasog(userMasogBalance) && hasEnoughMas(userMasBalance) && (
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
            />

            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-darkAccent/20 to-transparent" />

            <SubmitSection
              loading={isPending}
              hasEnoughMasog={hasEnoughMasog(userMasogBalance)}
            />
          </form>
        </div>
      )}
    </div>
  );
}
