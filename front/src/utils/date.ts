// export const DISCUSSION_PERIOD = 3 * 7 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds
// export const VOTING_PERIOD = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks in milliseconds
// TODO: Change this when tests done
export const DISCUSSION_PERIOD = 5 * 60 * 1000 // 5 minutes
export const VOTING_PERIOD = 5 * 60 * 1000 // 5 minutes
export const MIN_VOTING_BALANCE = 1n; // 1 MASOG

export const formatDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const calculateTimeLeft = (nextTransitionTime: number) => {
  const currentTime = new Date().getTime();
  const timeDiff = nextTransitionTime - currentTime;

  if (timeDiff <= 0) {
    return "Transitioning...";
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};
