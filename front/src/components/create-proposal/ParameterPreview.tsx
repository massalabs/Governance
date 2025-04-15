
interface ParameterPreviewProps {
    jsonString: string;
}

export const ParameterPreview: React.FC<ParameterPreviewProps> = ({ jsonString }) => {
    if (!jsonString) return null;

    return (
        <div className="space-y-2">
            <label className="block text-f-primary dark:text-darkText text-sm font-medium">
                Preview
            </label>
            <div className="bg-secondary/30 dark:bg-darkCard/30 border border-border/50 dark:border-darkAccent/50 rounded-xl p-4 backdrop-blur-sm">
                <pre className="text-sm whitespace-pre-wrap font-mono text-f-primary dark:text-darkText">
                    {jsonString}
                </pre>
            </div>
        </div>
    );
};