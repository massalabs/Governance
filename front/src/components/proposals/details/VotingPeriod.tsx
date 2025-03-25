interface VotingPeriodProps {
  creationTimestamp: bigint;
  status: string;
}

export function VotingPeriod({ creationTimestamp, status }: VotingPeriodProps) {
  const DISCUSSION_PERIOD = 3 * 7 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds
  const VOTING_PERIOD = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks in milliseconds

  const startDate = new Date(Number(creationTimestamp) + DISCUSSION_PERIOD);
  const endDate = new Date(
    Number(creationTimestamp) + DISCUSSION_PERIOD + VOTING_PERIOD
  );

  const isVotingEnded = status === "ACCEPTED" || status === "REJECTED";
  const currentTime = new Date().getTime();
  const votingEndTime =
    Number(creationTimestamp) + DISCUSSION_PERIOD + VOTING_PERIOD;
  const isTimeExpired = currentTime > votingEndTime;

  if (isVotingEnded || (status === "VOTING" && isTimeExpired)) {
    return (
      <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
        <div className="flex items-center justify-center p-4">
          <span
            className={`text-lg font-medium px-4 py-2 rounded-full ${
              status === "ACCEPTED"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : status === "REJECTED"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {status === "VOTING" && isTimeExpired
              ? "Pending Final Status"
              : status}
          </span>
        </div>
        <div className="mt-4 text-sm text-center text-f-tertiary dark:text-darkMuted">
          Voting ended on {endDate.toLocaleString()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/20 dark:bg-darkCard/20 border border-border/50 dark:border-darkAccent/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-f-primary dark:text-darkText mb-4">
        Voting Period
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-f-tertiary dark:text-darkMuted">Start</span>
          <span className="text-f-primary dark:text-darkText">
            {startDate.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-f-tertiary dark:text-darkMuted">End</span>
          <span className="text-f-primary dark:text-darkText">
            {endDate.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
