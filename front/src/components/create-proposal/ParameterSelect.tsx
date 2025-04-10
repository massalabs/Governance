import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface ParameterSelectProps {
    index: number;
    parameter: string;
    availableParameters: { category: string; params: any[] }[];
    selectedParameter: any;
    onParameterChange: (index: number, newParameter: string) => void;
}

export const ParameterSelect: React.FC<ParameterSelectProps> = ({
    index,
    parameter,
    availableParameters,
    selectedParameter,
    onParameterChange,
}) => {
    return (
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
                    value={parameter}
                    onChange={(e) => onParameterChange(index, e.target.value)}
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
            {parameter && (
                <p className="text-xs text-f-tertiary dark:text-darkMuted mt-1">
                    {selectedParameter?.description}
                </p>
            )}
        </div>
    );
}; 