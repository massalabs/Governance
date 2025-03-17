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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-f-primary mas-h2">Parameter Changes</h2>
        <div className="flex items-center text-f-tertiary">
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          <span className="mas-caption">Optional</span>
        </div>
      </div>

      <div className="space-y-6">
        {changes.map((change, index) => (
          <div
            key={index}
            className="bg-secondary/30 border border-border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-f-primary mas-body2">
                Parameter Change #{index + 1}
              </h3>
              {changes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChange(index)}
                  className="text-s-error hover:text-s-error/80 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parameter Name */}
              <div className="space-y-2">
                <label
                  htmlFor={`parameter-${index}`}
                  className="block text-f-primary mas-body2"
                >
                  Parameter Name
                </label>
                <input
                  type="text"
                  id={`parameter-${index}`}
                  value={change.parameter}
                  onChange={(e) => handleParameterChange(index, e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-f-primary focus:outline-none focus:ring-2 focus:ring-brand/30 mas-body"
                  placeholder="Enter parameter name"
                />
              </div>

              {/* Value Type Toggle */}
              <div className="space-y-2">
                <label className="block text-f-primary mas-body2">
                  Value Type
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!change.isObjectValue}
                      onChange={() => handleIsObjectToggle(index, false)}
                      className="text-brand focus:ring-brand"
                    />
                    <span className="text-f-primary mas-body2">
                      Simple Value
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={change.isObjectValue}
                      onChange={() => handleIsObjectToggle(index, true)}
                      className="text-brand focus:ring-brand"
                    />
                    <span className="text-f-primary mas-body2">
                      JSON Object
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Value Input */}
            <div className="space-y-2">
              <label
                htmlFor={`value-${index}`}
                className="block text-f-primary mas-body2"
              >
                New Value
              </label>
              {change.isObjectValue ? (
                <textarea
                  id={`value-${index}`}
                  value={change.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/30 text-f-primary"
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
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-f-primary focus:outline-none focus:ring-2 focus:ring-brand/30 mas-body"
                  placeholder="Enter new value"
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addChange}
          className="w-full py-2 px-4 border-2 border-dashed border-border rounded-lg text-f-tertiary hover:text-brand hover:border-brand transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="mas-body2">Add Another Parameter Change</span>
        </button>
      </div>

      {/* Preview */}
      {parameterChangeInput && (
        <div className="space-y-2">
          <label className="block text-f-primary mas-body2">Preview</label>
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono text-f-primary">
              {parameterChangeInput}
            </pre>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="text-s-error text-sm mt-2">{error}</div>}
    </div>
  );
}
