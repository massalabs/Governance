import { useCreateProposal } from "../hooks/useCreateProposal";
import { MasogBalanceAlert } from "../components/create-proposal/MasogBalanceAlert";
import { BasicInformationSection } from "../components/create-proposal/BasicInformationSection";
import { TechnicalDetailsSection } from "../components/create-proposal/TechnicalDetailsSection";
import { SubmitSection } from "../components/create-proposal/SubmitSection";

export default function CreateProposal() {
  const {
    formData,
    setFormData,
    parameterChangeInput,
    setParameterChangeInput,
    loading,
    hasEnoughMasog,
    userMasogBalance,
    handleSubmit,
    formatJson,
  } = useCreateProposal();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-f-primary mas-title mb-2">Create New Proposal</h1>
        <p className="text-f-tertiary mas-body">
          Submit a new governance proposal to improve the platform. Make sure to
          include a detailed forum post for discussion.
        </p>
      </div>

      <MasogBalanceAlert
        hasEnoughMasog={hasEnoughMasog}
        userMasogBalance={userMasogBalance}
      />

      <div className="bg-secondary border border-border rounded-lg shadow-sm divide-y divide-border">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <BasicInformationSection
            formData={formData}
            setFormData={setFormData}
          />

          <TechnicalDetailsSection
            parameterChangeInput={parameterChangeInput}
            setParameterChangeInput={setParameterChangeInput}
            formatJson={formatJson}
          />

          <SubmitSection loading={loading} hasEnoughMasog={hasEnoughMasog} />
        </form>
      </div>
    </div>
  );
}
