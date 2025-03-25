import { useGovernanceData } from "../../hooks/useGovernanceData";
import { truncateAddress } from "../../utils/address";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useContractStore } from "../../store/useContractStore";
import { useQuery } from "@tanstack/react-query";

interface VoteCommentsProps {
  proposalId: bigint;
}

export function VoteComments({ proposalId }: VoteCommentsProps) {
  const { proposalVotesMap, loading: votesLoading } = useGovernanceData();
  const { governance } = useContractStore();
  const votes = proposalVotesMap[proposalId.toString()] ?? [];

  const { data: comments = "", isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", proposalId.toString()],
    queryFn: async () => {
      if (!governance?.public) return "";
      return governance.public.getComments(proposalId);
    },
    enabled: !!governance?.public,
  });

  const loading = votesLoading || commentsLoading;

  if (loading) {
    return (
      <div className="text-center py-4 text-f-tertiary dark:text-darkMuted">
        Loading comments...
      </div>
    );
  }

  if (!votes || votes.length === 0) {
    return (
      <div className="text-center py-4 text-f-tertiary dark:text-darkMuted">
        No votes or comments have been cast yet
      </div>
    );
  }

  // Split comments into an array
  const commentsList = comments.split("\n").filter(Boolean);

  return (
    <div className="space-y-4">
      {votes.map((vote, index) => (
        <div
          key={index}
          className="bg-secondary/10 dark:bg-darkCard/10 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <ChatBubbleLeftIcon className="h-5 w-5 text-f-tertiary dark:text-darkMuted flex-shrink-0 mt-1" />
            <div className="space-y-2 flex-grow">
              <div className="flex items-center justify-between">
                <span className="text-sm text-f-tertiary dark:text-darkMuted">
                  {truncateAddress(vote.address)}
                </span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    vote.value === 1n
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : vote.value === -1n
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                  }`}
                >
                  {vote.value === 1n
                    ? "Yes"
                    : vote.value === -1n
                    ? "No"
                    : "Abstain"}
                </span>
              </div>
              {commentsList[index] && (
                <p className="text-f-primary dark:text-darkText">
                  {commentsList[index]}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
