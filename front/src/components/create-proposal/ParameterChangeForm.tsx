import { useState } from "react";
import {
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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

export function ParameterChangeForm({
  parameterChangeInput,
  setParameterChangeInput,
  error,
}: ParameterChangeFormProps) {
  const [changes, setChanges] = useState<ParameterChange[]>([
    { parameter: "", value: "", isObjectValue: false },
  ]);

  const handleParameterChange = (index: number, newParameter: string) => {
    const newChanges = [...changes];
    newChanges[index] = { ...newChanges[index], parameter: newParameter };
    setChanges(newChanges);
    updateJsonInput(newChanges);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newChanges = [...changes];
    newChanges[index] = { ...newChanges[index], value: newValue };
    setChanges(newChanges);
    updateJsonInput(newChanges);
  };

  const handleIsObjectToggle = (index: number, checked: boolean) => {
    const newChanges = [...changes];
    newChanges[index] = { ...newChanges[index], isObjectValue: checked };
    setChanges(newChanges);
    updateJsonInput(newChanges);
  };

  const addChange = () => {
    setChanges([
      ...changes,
      { parameter: "", value: "", isObjectValue: false },
    ]);
  };

  const removeChange = (index: number) => {
    const newChanges = changes.filter((_, i) => i !== index);
    setChanges(newChanges);
    updateJsonInput(newChanges);
  };

  const updateJsonInput = (changes: ParameterChange[]) => {
    const validChanges = changes.filter(
      (change) => change.parameter && change.value
    );

    if (validChanges.length === 0) {
      setParameterChangeInput("");
      return;
    }

    try {
      const parameterChanges = validChanges.map((change) => {
        const value = change.isObjectValue
          ? JSON.stringify(JSON.parse(change.value))
          : change.value;
        return {
          parameter: change.parameter,
          value,
        };
      });

      setParameterChangeInput(JSON.stringify(parameterChanges, null, 2));
    } catch (e) {
      // If JSON parsing fails, just set the raw values
      const parameterChanges = validChanges.map((change) => ({
        parameter: change.parameter,
        value: change.value,
      }));
      setParameterChangeInput(JSON.stringify(parameterChanges, null, 2));
    }
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

      <div className="space-y-6">
        {changes.map((change, index) => (
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
              {/* Parameter Name */}
              <div className="space-y-2">
                <label
                  htmlFor={`parameter-${index}`}
                  className="block text-f-primary dark:text-darkText text-sm font-medium"
                >
                  Parameter Name
                </label>
                <input
                  type="text"
                  id={`parameter-${index}`}
                  value={change.parameter}
                  onChange={(e) => handleParameterChange(index, e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg text-f-primary dark:text-darkText placeholder:text-f-tertiary/50 dark:placeholder:text-darkMuted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
                  placeholder="Enter parameter name"
                />
              </div>

              {/* Value Type Toggle */}
              {/* <div className="space-y-2">
                <label className="block text-f-primary dark:text-darkText text-sm font-medium">
                  Value Type
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!change.isObjectValue}
                      onChange={() => handleIsObjectToggle(index, false)}
                      className="text-brand dark:text-darkAccent focus:ring-brand dark:focus:ring-darkAccent"
                    />
                    <span className="text-f-primary dark:text-darkText text-sm">
                      Simple Value
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={change.isObjectValue}
                      onChange={() => handleIsObjectToggle(index, true)}
                      className="text-brand dark:text-darkAccent focus:ring-brand dark:focus:ring-darkAccent"
                    />
                    <span className="text-f-primary dark:text-darkText text-sm">
                      JSON Object
                    </span>
                  </label>
                </div>
              </div> */}
              <div className="space-y-2">
                <label
                  htmlFor={`value-${index}`}
                  className="block text-f-primary dark:text-darkText text-sm font-medium"
                >
                  New Value
                </label>
                {change.isObjectValue ? (
                  <textarea
                    id={`value-${index}`}
                    value={change.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-f-primary dark:text-darkText placeholder:text-f-tertiary/50 dark:placeholder:text-darkMuted/50 transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
                    rows={4}
                    placeholder='{
  "key": "value",
  "number": 123
}'
                    spellCheck="false"
                  />
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
              </div>
            </div>

            {/* Value Input */}
          </div>
        ))}

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
