import { FormattedProposal, ProposalStatus } from "../../types/governance";
import { useEffect, useState } from "react";

interface ProposalCountdownProps {
  proposal: FormattedProposal;
}

const DISCUSSION_PERIOD = 3 * 7 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds
const VOTING_PERIOD = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks in milliseconds

export function ProposalCountdown({ proposal }: ProposalCountdownProps) {
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = Date.now();
      const creationTime = Number(proposal.creationTimestamp) * 1000; // Convert to milliseconds
      let endTime: number;
      let nextPhase: string;

      if (proposal.status === ProposalStatus.DISCUSSION) {
        endTime = creationTime + DISCUSSION_PERIOD;
        nextPhase = "voting phase";
      } else if (proposal.status === ProposalStatus.VOTING) {
        endTime = creationTime + DISCUSSION_PERIOD + VOTING_PERIOD;
        nextPhase = "final decision";
      } else {
        setRemainingTime("");
        return;
      }

      if (now >= endTime) {
        setRemainingTime(`Time's up - Awaiting ${nextPhase}`);
        return;
      }

      const remaining = endTime - now;
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor(
        (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      setRemainingTime(`${days}d ${hours}h ${minutes}m until ${nextPhase}`);
    };

    calculateRemainingTime();
    const interval = setInterval(calculateRemainingTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [proposal.status, proposal.creationTimestamp]);

  if (
    !remainingTime ||
    (proposal.status !== ProposalStatus.DISCUSSION &&
      proposal.status !== ProposalStatus.VOTING)
  ) {
    return null;
  }

  return (
    <div className="text-sm text-f-tertiary flex items-center gap-2">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {remainingTime}
    </div>
  );
}
