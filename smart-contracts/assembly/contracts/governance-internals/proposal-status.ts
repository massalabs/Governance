import { bytesToString } from "@massalabs/as-types";
import { Storage } from "@massalabs/massa-as-sdk";
import { DISCUSSION_PERIOD, VOTING_PERIOD } from ".";
import { Proposal } from "../serializable/proposal";
import { Vote } from "../serializable/vote";
import { getMasogTotalSupply, getMasogBalance } from "./helpers";
import { discussionStatus, votingStatus, voteKey, acceptedStatus, rejectedStatus } from "./keys";

// Calculate the timestamp when voting starts for a proposal
export function getVotingStartTimestamp(proposal: Proposal): u64 {
  return proposal.creationTimestamp + DISCUSSION_PERIOD;
}

// Calculate the timestamp when voting ends for a proposal (inclusive)
export function getVotingEndTimestamp(proposal: Proposal): u64 {
  return proposal.creationTimestamp + DISCUSSION_PERIOD + VOTING_PERIOD;
}

// Check if the current timestamp is within the voting period
export function isInVotingPeriod(proposal: Proposal, currentTimestamp: u64): bool {
  const votingStart = getVotingStartTimestamp(proposal);
  const votingEnd = getVotingEndTimestamp(proposal);

  return currentTimestamp >= votingStart && currentTimestamp <= votingEnd;
}

// Check if the voting period has ended
export function hasVotingPeriodEnded(proposal: Proposal, currentTimestamp: u64): bool {
  return currentTimestamp > getVotingEndTimestamp(proposal);
}

export function updateProposalStatus(proposal: Proposal, currentTimestamp: u64): void {
  const elapsedTime = currentTimestamp - proposal.creationTimestamp;
  // Still in discussion period
  if (elapsedTime < DISCUSSION_PERIOD) {
    return; // No status change needed
  }

  // Transition from discussion to voting or keep in voting
  if (bytesToString(proposal.status) === bytesToString(discussionStatus) && isInVotingPeriod(proposal, currentTimestamp)) {
    proposal.setStatus(votingStatus).save();
    return;
  }

  // Process voting results if voting period is over
  if (bytesToString(proposal.status) === bytesToString(votingStatus) && hasVotingPeriodEnded(proposal, currentTimestamp)) {
    const allVotesKeys = Storage.getKeys(voteKey(proposal.id, ''));
    const totalSupply = getMasogTotalSupply();

    for (let i = 0; i < allVotesKeys.length; i++) {
      const userAddr = StaticArray.fromArray(allVotesKeys[i].slice(voteKey(proposal.id, '').length));
      const voteBytes = Storage.get(allVotesKeys[i]);
      const vote = new Vote();
      vote.deserialize(voteBytes, 0).unwrap();

      const userMasogBalance = getMasogBalance(bytesToString(userAddr));

      if (vote.value === 1) {
        proposal.positiveVoteVolume += userMasogBalance;
      } else if (vote.value === 0) {
        proposal.blankVoteVolume += userMasogBalance;
      } else if (vote.value === -1) {
        proposal.negativeVoteVolume += userMasogBalance;
      }
    }

    const majority = totalSupply / 2;
    if (proposal.positiveVoteVolume > majority) {
      proposal.setStatus(acceptedStatus);
    } else {
      proposal.setStatus(rejectedStatus);
    }
    proposal.save();
  }
}