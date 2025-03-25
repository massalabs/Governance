import { ParameterChanges } from "../ParameterChanges";

interface TechnicalDetailsSectionProps {
  parameterChange: string;
}

export function TechnicalDetailsSection({
  parameterChange,
}: TechnicalDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
        Technical Details
      </h2>
      <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-f-primary dark:text-darkText mb-4">
          Parameter Changes
        </h3>
        <ParameterChanges parameterChange={parameterChange} />
      </div>
    </div>
  );
}
