import { FormattedProposal } from "@/types/governance";
import { useEffect, useState, useMemo } from "react";
import {
  VOTING_PERIOD,
  formatDate,
  calculateTimeLeft,
  DISCUSSION_PERIOD,
} from "@/utils/date";

interface ProposalStatusProps {
  proposal: FormattedProposal;
}

const statusConfigs: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    darkColor: string;
    darkBgColor: string;
    nextStatus: string;
    countdownLabel: string;
  }
> = {
  DISCUSSION: {
    label: "Discussion",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    darkColor: "dark:text-indigo-400",
    darkBgColor: "dark:bg-indigo-400/10",
    nextStatus: "Voting",
    countdownLabel: "Voting starts on",
  },
  VOTING: {
    label: "Voting",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    darkColor: "dark:text-amber-400",
    darkBgColor: "dark:bg-amber-400/10",
    nextStatus: "Final Status",
    countdownLabel: "Results on",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    darkColor: "dark:text-emerald-400",
    darkBgColor: "dark:bg-emerald-400/10",
    nextStatus: "Completed",
    countdownLabel: "",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    darkColor: "dark:text-rose-400",
    darkBgColor: "dark:bg-rose-400/10",
    nextStatus: "Completed",
    countdownLabel: "",
  },
};

export function ProposalStatus({ proposal }: ProposalStatusProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { endDate, isVotingEnded, nextTransitionTime } = useMemo(() => {
    const start = new Date(
      Number(proposal.creationTimestamp) + DISCUSSION_PERIOD
    );
    const end = new Date(
      Number(proposal.creationTimestamp) + DISCUSSION_PERIOD + VOTING_PERIOD
    );

    const currentTime = new Date().getTime();
    const votingEndTime =
      Number(proposal.creationTimestamp) + DISCUSSION_PERIOD + VOTING_PERIOD;

    let nextTransition: number;
    if (proposal.status === "DISCUSSION") {
      nextTransition = Number(proposal.creationTimestamp) + DISCUSSION_PERIOD;
    } else if (proposal.status === "VOTING") {
      nextTransition = votingEndTime;
    } else {
      nextTransition = 0;
    }

    return {
      endDate: end,
      isVotingEnded: currentTime > votingEndTime,
      nextTransitionTime: nextTransition,
    };
  }, [proposal.creationTimestamp, proposal.status]);

  const isDiscussionEnded = useMemo(() => {
    if (!proposal.creationTimestamp) return false;
    const discussionEndTime = Number(proposal.creationTimestamp) + DISCUSSION_PERIOD;
    return new Date().getTime() > discussionEndTime;
  }, [proposal.creationTimestamp]);

  const statusConfig = statusConfigs[proposal.status] || {
    label: proposal.status,
    color: "text-f-tertiary",
    bgColor: "bg-f-tertiary/10",
    darkColor: "dark:text-darkMuted",
    darkBgColor: "dark:bg-darkMuted/10",
    nextStatus: "Unknown",
    countdownLabel: "",
  };

  useEffect(() => {
    const updateTimeLeft = () => {
      if (proposal.status === "ACCEPTED" || proposal.status === "REJECTED") {
        setTimeLeft("Completed");
        return;
      }
      setTimeLeft(calculateTimeLeft(nextTransitionTime));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [proposal.status, nextTransitionTime]);

  const getNextStatusDate = () => {
    if (proposal.status === "DISCUSSION") {
      return new Date(Number(proposal.creationTimestamp) + DISCUSSION_PERIOD);
    } else if (proposal.status === "VOTING") {
      return endDate;
    }
    return null;
  };

  const nextStatusDate = getNextStatusDate();

  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <div className="flex items-center justify-center p-4">
        <span
          className={`text-lg font-medium px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.darkBgColor} ${statusConfig.darkColor}`}
        >
          {isVotingEnded && proposal.status === "VOTING"
            ? "Calculating Results"
            : isDiscussionEnded && proposal.status === "DISCUSSION"
              ? "Starting Voting"
              : statusConfig.label}
        </span>
      </div>

      {isVotingEnded ? (
        <div className="mt-4 text-center">
          <div className="text-sm text-f-tertiary dark:text-darkMuted">
            Voting ended on {formatDate(endDate)}
          </div>
          {proposal.status === "VOTING" && (
            <div className="mt-2 text-sm text-amber-500 dark:text-amber-400">
              Please wait for the final results
            </div>
          )}
        </div>
      ) : (
        <>
          {nextStatusDate && (
            <div className="mt-4 space-y-1 text-center">
              <div className="text-sm text-f-tertiary dark:text-darkMuted">
                {statusConfig.countdownLabel} {formatDate(nextStatusDate)}
              </div>
              <div className="font-medium text-f-primary dark:text-darkText">
                {timeLeft}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
