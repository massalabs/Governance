import { ConnectButton } from "../connect-wallet-popup";
import { FORUM_URLS } from "../../constants/urls";

interface WelcomeSectionProps {
  isConnected: boolean;
}

export function WelcomeSection({ isConnected }: WelcomeSectionProps) {
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
        <h1 className="text-2xl font-bold text-f-primary mas-title">
          Welcome to Massa Governance
        </h1>
        <p className="text-f-tertiary mas-body text-center max-w-md">
          Connect your wallet to view and participate in governance proposals
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <section className="text-center">
      <h1 className="text-4xl font-bold text-f-primary mb-4 mas-banner">
        Welcome to Governance Portal
      </h1>
      <p className="text-f-tertiary max-w-2xl mx-auto mas-body">
        Participate in the decision-making process of our platform. Vote on
        proposals and help shape the future of our ecosystem.{" "}
        <a
          href={FORUM_URLS.GOVERNANCE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-f-primary hover:underline"
        >
          Learn more about decentralized governance on Massa on the forum
        </a>
        .
      </p>
    </section>
  );
}
