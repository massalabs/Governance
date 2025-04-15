import { FormattedProposal } from "@/types/governance";
import { useEffect, useState, useMemo } from "react";
import { formatDate, calculateTimeLeft } from "@/utils/date";
import { getStatusConfig, getDisplayStatus } from "@/utils/proposalStatus";
import { DISCUSSION_PERIOD, VOTING_PERIOD } from "@/config";
import { ProposalStatus as ProposalStatusEnum } from "@/config";

interface ProposalStatusProps {
  proposal: FormattedProposal;
}

export function ProposalStatus({ proposal }: ProposalStatusProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { endDate, isVotingEnded, nextTransitionTime } = useMemo(() => {
    const end = new Date(
      Number(proposal.creationTimestamp) + Number(DISCUSSION_PERIOD) + Number(VOTING_PERIOD)
    );

    const currentTime = new Date().getTime();
    const votingEndTime =
      Number(proposal.creationTimestamp) + Number(DISCUSSION_PERIOD) + Number(VOTING_PERIOD);

    let nextTransition: number;
    if (proposal.status === ProposalStatusEnum.DISCUSSION) {
      nextTransition = Number(proposal.creationTimestamp) + Number(DISCUSSION_PERIOD);
    } else if (proposal.status === ProposalStatusEnum.VOTING) {
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

  const statusConfig = getStatusConfig(proposal.status);
  const displayStatus = getDisplayStatus(proposal);

  useEffect(() => {
    const updateTimeLeft = () => {
      if (proposal.status === ProposalStatusEnum.ACCEPTED || proposal.status === ProposalStatusEnum.REJECTED) {
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
    if (proposal.status === ProposalStatusEnum.DISCUSSION) {
      return new Date(Number(proposal.creationTimestamp) + Number(DISCUSSION_PERIOD));
    } else if (proposal.status === ProposalStatusEnum.VOTING) {
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
          {displayStatus}
        </span>
      </div>

      {isVotingEnded ? (
        <div className="mt-4 text-center">
          <div className="text-sm text-f-tertiary dark:text-darkMuted">
            Voting ended on {formatDate(endDate)}
          </div>
          {proposal.status === ProposalStatusEnum.VOTING && (
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
