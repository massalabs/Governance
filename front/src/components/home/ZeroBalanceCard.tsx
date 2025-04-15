import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";

export const ZeroBalanceCard = () => (
    <div className="bg-secondary/20 dark:bg-darkCard/20 rounded-lg p-6 border border-border/50 dark:border-darkBorder/50">
        <div className="space-y-4">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-darkAccent/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-brand dark:text-darkAccent">
                            0
                        </span>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-f-primary dark:text-darkText mb-1">
                        No MASOG Tokens
                    </h3>
                    <p className="text-sm text-f-tertiary dark:text-darkMuted">
                        To participate in governance, you need to run a Massa node and stake
                        rolls to earn MASOG tokens.
                    </p>
                </div>
            </div>
            <a
                href="https://docs.massa.net/docs/node/install"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand dark:text-darkAccent hover:opacity-80 transition-opacity"
            >
                Learn how to run a node and stake rolls
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
        </div>
    </div>
);
