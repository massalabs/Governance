import { useState, useEffect } from "react";
import {
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { AVAILABLE_GOVERNANCE_PARAMETERS } from "../../config";

interface ParameterChange {
  parameter: string;
  value: string;
  isObjectValue: boolean;
}

interface ParameterChangeFormProps {
  parameterChangeInput: string;
  setParameterChangeInput: (value: string) => void;
  error?: string;
}

// Helper function to get all parameters as a flat array
const getAllParameters = () => {
  return Object.values(AVAILABLE_GOVERNANCE_PARAMETERS).flat();
};

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

  // Maximum size in bytes for parameter change data
  const MAX_PARAMETER_CHANGE_SIZE = 500;

  // Get a list of parameters that are already selected
  const getSelectedParameters = () => {
    return changes
      .map(change => change.parameter)
      .filter(param => param !== "");
  };

  // Filter out already selected parameters from the dropdown options
  const getAvailableParameters = (currentIndex: number) => {
    const selectedParams = getSelectedParameters();
    return Object.entries(AVAILABLE_GOVERNANCE_PARAMETERS).map(([category, params]) => {
      // Filter out parameters that are already selected in other rows
      const availableParams = params.filter(param =>
        param.id === changes[currentIndex].parameter || !selectedParams.includes(param.id)
      );

      return {
        category,
        params: availableParams
      };
    });
  };

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

    if (!parameter) return;

    const newErrors = [...validationErrors];
    newErrors[index] = "";

    if (parameter.type === "number") {
      const numValue = Number(value);

      if (isNaN(numValue)) {
        newErrors[index] = "Value must be a number";
      } else if (parameter.min !== undefined && numValue < parameter.min) {
        newErrors[index] = `Value must be at least ${parameter.min}`;
      } else if ('max' in parameter && typeof parameter.max === 'number' && numValue > parameter.max) {
        newErrors[index] = `Value must be at most ${parameter.max}`;
      }
    } else if (parameter.type === "text") {
      if ('maxLength' in parameter && typeof parameter.maxLength === 'number' && value.length > parameter.maxLength) {
        newErrors[index] = `Text must be at most ${parameter.maxLength} characters`;
      }
    }

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
    const validChanges = changes.filter(
      (change) => change.parameter && change.value && !validationErrors[changes.indexOf(change)]
    );

    if (validChanges.length === 0) {
      setParameterChangeInput("");
      setSizeWarning(null);
      return;
    }

    try {
      const parameterChanges = validChanges.map((change) => {
        const parameter = allParameters.find(
          (p) => p.id === change.parameter
        );

        let value: string | number = change.value;

        // Convert to appropriate type
        if (parameter?.type === "number") {
          value = Number(change.value);
        }

        return {
          parameter: change.parameter,
          value,
        };
      });

      const jsonString = JSON.stringify(parameterChanges, null, 2);
      setParameterChangeInput(jsonString);

      // Calculate the size of the parameter change data
      const dataSize = new TextEncoder().encode(jsonString).length;

      // Set warning if approaching or exceeding the limit
      if (dataSize >= MAX_PARAMETER_CHANGE_SIZE) {
        setSizeWarning(`Parameter change data exceeds the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes. Please reduce the number of parameters or simplify the values.`);
      } else if (dataSize >= MAX_PARAMETER_CHANGE_SIZE * 0.8) {
        setSizeWarning(`Parameter change data is approaching the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes.`);
      } else {
        setSizeWarning(null);
      }
    } catch (e) {
      // If JSON parsing fails, just set the raw values
      const parameterChanges = validChanges.map((change) => ({
        parameter: change.parameter,
        value: change.value,
      }));
      const jsonString = JSON.stringify(parameterChanges, null, 2);
      setParameterChangeInput(jsonString);

      // Calculate the size of the parameter change data
      const dataSize = new TextEncoder().encode(jsonString).length;

      // Set warning if approaching or exceeding the limit
      if (dataSize >= MAX_PARAMETER_CHANGE_SIZE) {
        setSizeWarning(`Parameter change data exceeds the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes. Please reduce the number of parameters or simplify the values.`);
      } else if (dataSize >= MAX_PARAMETER_CHANGE_SIZE * 0.8) {
        setSizeWarning(`Parameter change data is approaching the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes.`);
      } else {
        setSizeWarning(null);
      }
    }
  };

  // Initialize validation errors array when component mounts
  useEffect(() => {
    setValidationErrors(new Array(changes.length).fill(""));
  }, []);

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
          const selectedParameter = allParameters.find(
            (p) => p.id === change.parameter
          );
          const availableParameters = getAvailableParameters(index);

          return (
            <div
              key={index}
              className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-xl p-6 space-y-5 backdrop-blur-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-f-primary dark:text-darkText">
                  Parameter Change #{index + 1}
                </h3>
                {changes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChange(index)}
                    className="text-s-error hover:text-s-error/80 transition-colors p-1.5 rounded-lg hover:bg-s-error/10"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parameter Name Dropdown */}
                <div className="space-y-2">
                  <label
                    htmlFor={`parameter-${index}`}
                    className="block text-f-primary dark:text-darkText text-sm font-medium"
                  >
                    Parameter Name
                  </label>
                  <div className="relative">
                    <select
                      id={`parameter-${index}`}
                      value={change.parameter}
                      onChange={(e) => handleParameterChange(index, e.target.value)}
                      className="w-full px-4 py-2.5 pr-12 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg text-f-primary dark:text-darkText focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80 appearance-none"
                    >
                      <option value="">Select a parameter</option>
                      {availableParameters.map(({ category, params }) => (
                        params.length > 0 && (
                          <optgroup key={category} label={category}>
                            {params.map((param) => (
                              <option key={param.id} value={param.id}>
                                {param.name}
                              </option>
                            ))}
                          </optgroup>
                        )
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDownIcon className="h-5 w-5 text-f-tertiary dark:text-darkMuted" />
                    </div>
                  </div>
                  {change.parameter && (
                    <p className="text-xs text-f-tertiary dark:text-darkMuted mt-1">
                      {selectedParameter?.description}
                    </p>
                  )}
                </div>

                {/* Value Input */}
                {change.parameter && selectedParameter && (
                  <div className="space-y-2">
                    <label
                      htmlFor={`value-${index}`}
                      className="block text-f-primary dark:text-darkText text-sm font-medium"
                    >
                      New Value
                    </label>
                    {selectedParameter.type === "number" ? (
                      <input
                        type="number"
                        id={`value-${index}`}
                        value={change.value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        min={selectedParameter.min}
                        max={'max' in selectedParameter && typeof selectedParameter.max === 'number' ? selectedParameter.max : undefined}
                        step={selectedParameter.step}
                        className="w-full px-4 py-2.5 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg text-f-primary dark:text-darkText placeholder:text-f-tertiary/50 dark:placeholder:text-darkMuted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
                        placeholder={`Enter ${selectedParameter.name.toLowerCase()}`}
                      />
                    ) : selectedParameter.type === "text" ? (
                      <div className="space-y-1">
                        <textarea
                          id={`value-${index}`}
                          value={change.value}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                          maxLength={'maxLength' in selectedParameter && typeof selectedParameter.maxLength === 'number' ? selectedParameter.maxLength : undefined}
                          rows={3}
                          className="w-full px-4 py-2.5 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg text-f-primary dark:text-darkText placeholder:text-f-tertiary/50 dark:placeholder:text-darkMuted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
                          placeholder={`Enter ${selectedParameter.name.toLowerCase()}`}
                        />
                        {'maxLength' in selectedParameter && typeof selectedParameter.maxLength === 'number' && (
                          <div className="flex justify-end">
                            <span className="text-xs text-f-tertiary dark:text-darkMuted">
                              {change.value.length}/{selectedParameter.maxLength} characters
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        id={`value-${index}`}
                        value={change.value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        className="w-full px-4 py-2.5 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg text-f-primary dark:text-darkText placeholder:text-f-tertiary/50 dark:placeholder:text-darkMuted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
                        placeholder="Enter new value"
                      />
                    )}
                    {validationErrors[index] && (
                      <p className="text-xs text-s-error mt-1">
                        {validationErrors[index]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
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

      {/* Preview */}
      {parameterChangeInput && (
        <div className="space-y-2">
          <label className="block text-f-primary dark:text-darkText text-sm font-medium">
            Preview
          </label>
          <div className="bg-secondary/30 dark:bg-darkCard/30 border border-border/50 dark:border-darkAccent/50 rounded-xl p-4 backdrop-blur-sm">
            <pre className="text-sm whitespace-pre-wrap font-mono text-f-primary dark:text-darkText">
              {parameterChangeInput}
            </pre>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-s-error text-sm mt-2 bg-s-error/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 