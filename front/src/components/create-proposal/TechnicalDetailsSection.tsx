import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface TechnicalDetailsSectionProps {
  parameterChangeInput: string;
  setParameterChangeInput: (value: string) => void;
  formatJson: () => void;
}

export function TechnicalDetailsSection({
  parameterChangeInput,
  setParameterChangeInput,
  formatJson,
}: TechnicalDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-f-primary mas-h2">Technical Details</h2>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="parameterChange" className="text-f-primary mas-body2">
            Parameter Change (JSON)
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={formatJson}
              className="text-brand hover:text-brand/80 mas-caption transition-colors"
            >
              Format JSON
            </button>
            <div className="flex items-center text-f-tertiary">
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              <span className="mas-caption">Optional</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <textarea
            name="parameterChange"
            id="parameterChange"
            rows={8}
            value={parameterChangeInput}
            onChange={(e) => setParameterChangeInput(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand/30 text-f-primary"
            placeholder='{
  "parameter": "example_param",
  "value": "example_value"
}'
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
