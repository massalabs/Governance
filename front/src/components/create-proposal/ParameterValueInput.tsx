interface ParameterValueInputProps {
    index: number;
    value: string;
    selectedParameter: any;
    validationError: string;
    onValueChange: (index: number, newValue: string) => void;
}

export const ParameterValueInput: React.FC<ParameterValueInputProps> = ({
    index,
    value,
    selectedParameter,
    validationError,
    onValueChange,
}) => {
    if (!selectedParameter) return null;

    return (
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
                    value={value}
                    onChange={(e) => onValueChange(index, e.target.value)}
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
                        value={value}
                        onChange={(e) => onValueChange(index, e.target.value)}
                        maxLength={'maxLength' in selectedParameter && typeof selectedParameter.maxLength === 'number' ? selectedParameter.maxLength : undefined}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg text-f-primary dark:text-darkText placeholder:text-f-tertiary/50 dark:placeholder:text-darkMuted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
                        placeholder={`Enter ${selectedParameter.name.toLowerCase()}`}
                    />
                    {'maxLength' in selectedParameter && typeof selectedParameter.maxLength === 'number' && (
                        <div className="flex justify-end">
                            <span className="text-xs text-f-tertiary dark:text-darkMuted">
                                {value.length}/{selectedParameter.maxLength} characters
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <input
                    type="text"
                    id={`value-${index}`}
                    value={value}
                    onChange={(e) => onValueChange(index, e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg text-f-primary dark:text-darkText placeholder:text-f-tertiary/50 dark:placeholder:text-darkMuted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-darkAccent/30 text-sm transition-all hover:border-border/80 dark:hover:border-darkAccent/80"
                    placeholder="Enter new value"
                />
            )}
            {validationError && (
                <p className="text-xs text-s-error mt-1">
                    {validationError}
                </p>
            )}
        </div>
    );
}; 