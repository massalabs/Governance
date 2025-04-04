import { ConnectButton } from "./connect-wallet-popup";

export const WalletNotConnected = () => (
    <div className="max-w-2xl mx-auto p-8">
        <div className="relative overflow-hidden bg-secondary/40 dark:bg-darkCard/40 backdrop-blur-sm border border-primary/10 dark:border-darkAccent/10 rounded-2xl shadow-lg p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-darkAccent/5" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 dark:bg-darkAccent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 dark:bg-darkAccent/10 rounded-full blur-3xl" />

            <div className="relative space-y-6 text-center">
                <h2 className="text-2xl font-bold text-f-primary dark:text-darkText">
                    Connect Your Wallet
                </h2>
                <p className="text-f-tertiary dark:text-darkMuted mas-body text-lg">
                    To create a new governance proposal, please connect your wallet first
                </p>
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