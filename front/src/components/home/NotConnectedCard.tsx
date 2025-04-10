import { ConnectButton } from "../connect-wallet-popup";

export const NotConnectedCard = () => (
    <div className="bg-secondary/20 dark:bg-darkCard/20 rounded-lg p-6 border border-border/50 dark:border-darkBorder/50">
        <div className="space-y-4">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-darkAccent/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-brand dark:text-darkAccent">
                            ?
                        </span>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-f-primary dark:text-darkText mb-1">
                        Connect Your Wallet
                    </h3>
                    <p className="text-sm text-f-tertiary dark:text-darkMuted">
                        Connect your wallet to view your MASOG balance and voting power.
                    </p>
                </div>
            </div>
            <div className="flex justify-start">
                <ConnectButton />
            </div>
        </div>
    </div>
);
