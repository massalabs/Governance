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
    <div className="space-y-6">
      <h2 className="text-f-primary mas-h2">Technical Details</h2>
      <ParameterChangeForm
        parameterChangeInput={parameterChangeInput}
        setParameterChangeInput={setParameterChangeInput}
        error={error}
      />
    </div>
  );
}
