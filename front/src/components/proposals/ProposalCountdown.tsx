import { FormattedProposal, ProposalStatus } from "../../types/governance";
import { useEffect, useState } from "react";

interface ProposalCountdownProps {
  proposal: FormattedProposal;
}

const DISCUSSION_PERIOD = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
const VOTING_PERIOD = 3 * 7 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds (5 weeks total - 2 weeks discussion)

export function ProposalCountdown({ proposal }: ProposalCountdownProps) {
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [votingDates, setVotingDates] = useState<{
    start: string;
    end: string;
  } | null>(null);

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
        // For voting phase, end time is 5 weeks from creation
        endTime = creationTime + 5 * 7 * 24 * 60 * 60 * 1000;
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

    const calculateVotingDates = () => {
      const creationTime = Number(proposal.creationTimestamp) * 1000;
      const votingStart = new Date(creationTime + DISCUSSION_PERIOD);
      const votingEnd = new Date(creationTime + 5 * 7 * 24 * 60 * 60 * 1000);

      setVotingDates({
        start: votingStart.toLocaleString(),
        end: votingEnd.toLocaleString(),
      });
    };

    calculateRemainingTime();
    calculateVotingDates();
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
    <div className="space-y-2">
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
      {votingDates && proposal.status === ProposalStatus.VOTING && (
        <div className="text-xs text-f-tertiary space-y-1">
          <div>Start: {votingDates.start}</div>
          <div>End: {votingDates.end}</div>
        </div>
      )}
    </div>
  );
}
