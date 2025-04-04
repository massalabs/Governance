import { FORUM_URLS } from "../../constants/urls";

export function WelcomeSection() {

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
