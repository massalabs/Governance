import { TrashIcon } from "@heroicons/react/24/outline";
import { ParameterSelect } from "./ParameterSelect";
import { ParameterValueInput } from "./ParameterValueInput";
import { ParameterChange } from "./types";

interface ParameterChangeItemProps {
    index: number;
    change: ParameterChange;
    allParameters: any[];
    availableParameters: { category: string; params: any[] }[];
    validationError: string;
    onParameterChange: (index: number, newParameter: string) => void;
    onValueChange: (index: number, newValue: string) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}

export const ParameterChangeItem: React.FC<ParameterChangeItemProps> = ({
    index,
    change,
    allParameters,
    availableParameters,
    validationError,
    onParameterChange,
    onValueChange,
    onRemove,
    canRemove
}) => {
    const selectedParameter = allParameters.find(
        (p) => p.id === change.parameter
    );

    return (
        <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-xl p-6 space-y-5 backdrop-blur-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-f-primary dark:text-darkText">
                    Parameter Change #{index + 1}
                </h3>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-s-error hover:text-s-error/80 transition-colors p-1.5 rounded-lg hover:bg-s-error/10"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ParameterSelect
                    index={index}
                    parameter={change.parameter}
                    availableParameters={availableParameters}
                    selectedParameter={selectedParameter}
                    onParameterChange={onParameterChange}
                />

                {change.parameter && selectedParameter && (
                    <ParameterValueInput
                        index={index}
                        value={change.value}
                        selectedParameter={selectedParameter}
                        validationError={validationError}
                        onValueChange={onValueChange}
                    />
                )}
            </div>
        </div>
    );
};