import {
  useCreateProposalMutation,
  validateForm,
  hasEnoughMasog,
  hasEnoughMas,
  type ValidationErrors,
} from "@/react-queries/useCreateProposalMutation";
import { MasogBalanceAlert } from "@/components/create-proposal/MasogBalanceAlert";
import { BasicInformationSection } from "@/components/create-proposal/BasicInformationSection";
import { TechnicalDetailsSection } from "@/components/create-proposal/TechnicalDetailsSection";
import { SubmitSection } from "@/components/create-proposal/SubmitSection";
import { useState } from "react";
import { CreateProposalParams } from "../types/governance";
import { useGovernanceData } from "@/react-queries/useGovernanceData";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { Divider } from "@/components/ui/Divider";
import { HeaderSection } from "@/components/create-proposal/HeaderSection";
import { WalletNotConnected } from "@/components/wallet/wallet-not-connected";
import { networkName } from "@/config";

export default function CreateProposal() {
  const { connectedAccount, network } = useAccountStore();
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

  if (!connectedAccount || !network) {
    return <WalletNotConnected />;
  }

  if (network.name !== networkName) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-secondary/40 dark:bg-darkCard/40 backdrop-blur-sm border border-primary/10 dark:border-darkAccent/10 rounded-2xl shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Network Switch Required</h2>
          <p className="text-muted-foreground">Please switch to {networkName} to create a proposal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <HeaderSection />

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

            <Divider />

            <TechnicalDetailsSection
              parameterChangeInput={parameterChangeInput}
              setParameterChangeInput={setParameterChangeInput}
              error={errors.parameterChange}
            />

            <Divider />

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


