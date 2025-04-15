import { useState, useEffect } from "react";
import { InformationCircleIcon, PlusIcon, ExclamationTriangleIcon, } from "@heroicons/react/24/outline";
import { generateJsonInput, getAllParameters, getAvailableParameters, validateParameterValue } from "./helpers";
import { ParameterChangeItem } from "./ParameterChangeItem";
import { ParameterPreview } from "./ParameterPreview";
import { ParameterChange } from "./types";


interface ParameterChangeFormProps {
  parameterChangeInput: string;
  setParameterChangeInput: (value: string) => void;
  error?: string;
}

export function ParameterChangeForm({
  parameterChangeInput,
  setParameterChangeInput,
  error,
}: ParameterChangeFormProps) {
  const [changes, setChanges] = useState<ParameterChange[]>([
    { parameter: "", value: "", isObjectValue: false },
  ]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const allParameters = getAllParameters();

  // Initialize validation errors array when component mounts
  useEffect(() => {
    setValidationErrors(new Array(changes.length).fill(""));
  }, []);

  const handleParameterChange = (index: number, newParameter: string) => {
    const newChanges = [...changes];
    newChanges[index] = { ...newChanges[index], parameter: newParameter, value: "" };
    setChanges(newChanges);
    updateJsonInput(newChanges);
    setValidationErrors([]);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newChanges = [...changes];
    newChanges[index] = { ...newChanges[index], value: newValue };
    setChanges(newChanges);

    // Validate the value based on parameter type
    validateValue(index, newValue);

    updateJsonInput(newChanges);
  };

  const validateValue = (index: number, value: string) => {
    const parameter = allParameters.find(
      (p) => p.id === changes[index].parameter
    );

    const error = validateParameterValue(parameter, value);

    const newErrors = [...validationErrors];
    newErrors[index] = error;
    setValidationErrors(newErrors);
  };

  const addChange = () => {
    setChanges([
      ...changes,
      { parameter: "", value: "", isObjectValue: false },
    ]);
    setValidationErrors([...validationErrors, ""]);
  };

  const removeChange = (index: number) => {
    const newChanges = changes.filter((_, i) => i !== index);
    setChanges(newChanges);
    const newErrors = validationErrors.filter((_, i) => i !== index);
    setValidationErrors(newErrors);
    updateJsonInput(newChanges);
  };

  const updateJsonInput = (changes: ParameterChange[]) => {
    const { jsonString, sizeWarning } = generateJsonInput(changes, allParameters, validationErrors);
    setParameterChangeInput(jsonString);
    setSizeWarning(sizeWarning);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-f-tertiary dark:text-darkMuted text-sm">
            Define the technical parameters to be modified
          </p>
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-f-tertiary dark:text-darkMuted" />
            <p className="text-f-tertiary dark:text-darkMuted text-sm">
              Each parameter change will be applied to the governance contract
            </p>
          </div>
        </div>
      </div>

      {/* Size Warning */}
      {sizeWarning && (
        <div className="flex items-start gap-2 p-3 bg-s-warning/10 border border-s-warning/30 rounded-lg">
          <ExclamationTriangleIcon className="w-5 h-5 text-s-warning flex-shrink-0 mt-0.5" />
          <p className="text-s-warning text-sm">{sizeWarning}</p>
        </div>
      )}

      <div className="space-y-6">
        {changes.map((change, index) => {
          const availableParameters = getAvailableParameters(changes, index);

          return (
            <ParameterChangeItem
              key={index}
              index={index}
              change={change}
              allParameters={allParameters}
              availableParameters={availableParameters}
              validationError={validationErrors[index]}
              onParameterChange={handleParameterChange}
              onValueChange={handleValueChange}
              onRemove={removeChange}
              canRemove={changes.length > 1}
            />
          );
        })}

        <button
          type="button"
          onClick={addChange}
          className="w-full py-3 px-4 border-2 border-dashed border-border/50 dark:border-darkAccent/50 rounded-xl text-f-tertiary dark:text-darkMuted hover:text-brand dark:hover:text-darkAccent hover:border-brand dark:hover:border-darkAccent transition-all flex items-center justify-center gap-2 hover:bg-secondary/20 dark:hover:bg-darkCard/20"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="text-sm font-medium">
            Add Another Parameter Change
          </span>
        </button>
      </div>

      <ParameterPreview jsonString={parameterChangeInput} />

      {error && (
        <div className="text-s-error text-sm mt-2 bg-s-error/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 