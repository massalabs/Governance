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
    hasEnoughMas,
    userMasBalance,
    handleSubmit,
    errors,
  } = useCreateProposal();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
          Create New Proposal
        </h1>
        <p className="text-f-tertiary dark:text-darkMuted mas-body text-lg max-w-2xl mx-auto">
          Submit a new governance proposal to improve the platform. Make sure to
          include a detailed forum post for discussion.
        </p>
      </div>

      <MasogBalanceAlert
        hasEnoughMasog={hasEnoughMasog}
        userMasogBalance={userMasogBalance}
        hasEnoughMas={hasEnoughMas}
        userMasBalance={userMasBalance}
      />

      {/* Main Form */}
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

          <SubmitSection loading={loading} hasEnoughMasog={hasEnoughMasog} />
        </form>
      </div>
    </div>
  );
}
