import { ConnectButton } from "./connect-wallet-popup";

export const WalletNotConnected = () => (
    <div className="max-w-xl mx-auto p-6">
        <div className="relative overflow-hidden bg-secondary dark:bg-darkCard border border-border dark:border-darkBorder rounded-lg shadow-sm p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-darkAccent/5" />

            <div className="relative space-y-6 text-center">
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-f-primary dark:text-darkText bg-gradient-to-r from-primary dark:from-darkAccent to-primary/80 dark:to-darkAccent/80 bg-clip-text text-transparent">
                        Connect Your Wallet
                    </h2>
                    <p className="text-f-tertiary dark:text-darkMuted mas-body text-lg">
                        To create a new governance proposal, please connect your wallet first
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="transform transition-all duration-300 hover:scale-105">
                        <ConnectButton />
                    </div>
                </div>

                <p className="text-sm text-f-tertiary dark:text-darkMuted">
                    You'll need MASOG tokens to create a proposal
                </p>
            </div>
        </div>
    </div>
);