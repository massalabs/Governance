import { DISCUSSION_PERIOD, VOTING_PERIOD } from "@/config";
import { ProposalStatus } from "../types/governance";

export interface StatusConfig {
    label: string;
    color: string;
    bgColor: string;
    darkColor: string;
    darkBgColor: string;
    nextStatus?: string;
    countdownLabel?: string;
}

export const getStatusConfig = (status: ProposalStatus): StatusConfig => {
    return statusConfigs[status] || {
        label: status,
        color: "text-f-tertiary",
        bgColor: "bg-f-tertiary/10",
        darkColor: "dark:text-darkMuted",
        darkBgColor: "dark:bg-darkMuted/10",
    };
};

export const getDisplayStatus = (
    proposal: { status: ProposalStatus; creationTimestamp: bigint }
): string => {
    const currentTime = new Date().getTime();
    const discussionEndTime = Number(proposal.creationTimestamp) + Number(DISCUSSION_PERIOD);
    const votingEndTime = discussionEndTime + Number(VOTING_PERIOD);

    const isDiscussionEnded = currentTime > discussionEndTime;
    const isVotingEnded = currentTime > votingEndTime;

    if (proposal.status === "VOTING" && isVotingEnded) {
        return "Calculating Results";
    } else if (proposal.status === "DISCUSSION" && isDiscussionEnded) {
        return "Starting Voting";
    } else {
        return getStatusConfig(proposal.status).label;
    }
};

const statusConfigs: Record<ProposalStatus, StatusConfig> = {
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