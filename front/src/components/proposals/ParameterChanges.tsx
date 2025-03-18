import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface ParameterChangesProps {
  parameterChange: string;
}

export function ParameterChanges({ parameterChange }: ParameterChangesProps) {
  try {
    const changes = JSON.parse(parameterChange);
    const changesArray = Array.isArray(changes) ? changes : [changes];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-f-tertiary dark:text-darkMuted">
          <ArrowPathIcon className="h-4 w-4" />
          <span>Parameter Changes</span>
        </div>

        <div className="space-y-4">
          {changesArray.map((change, index) => {
            const isObjectValue =
              typeof change.value === "string" && change.value.startsWith("{");

            return (
              <div
                key={index}
                className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Parameter Name */}
                  <div>
                    <div className="text-sm text-f-tertiary dark:text-darkMuted mb-1">
                      Parameter Name
                    </div>
                    <div className="font-medium text-f-primary dark:text-darkText">
                      {change.parameter}
                    </div>
                  </div>

                  {/* New Value */}
                  <div>
                    <div className="text-sm text-f-tertiary dark:text-darkMuted mb-1">
                      New Value
                    </div>
                    <div className="font-medium text-f-primary dark:text-darkText">
                      {isObjectValue ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(JSON.parse(change.value), null, 2)}
                        </pre>
                      ) : (
                        change.value
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="text-f-tertiary dark:text-darkMuted bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-4">
        Invalid parameter change format
      </div>
    );
  }
}
