import { ParameterChangeForm } from "./ParameterChangeForm";

interface TechnicalDetailsSectionProps {
  parameterChangeInput: string;
  setParameterChangeInput: (value: string) => void;
  error?: string;
}

export function TechnicalDetailsSection({
  parameterChangeInput,
  setParameterChangeInput,
  error,
}: TechnicalDetailsSectionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-f-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Technical Details
        </h2>
      </div>
      <ParameterChangeForm
        parameterChangeInput={parameterChangeInput}
        setParameterChangeInput={setParameterChangeInput}
        error={error}
      />
    </div>
  );
}
