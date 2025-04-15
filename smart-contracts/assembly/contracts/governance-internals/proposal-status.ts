import { bytesToI32, bytesToString } from "@massalabs/as-types";
import { generateEvent, Storage } from "@massalabs/massa-as-sdk";

import { Proposal } from "../serializable/proposal";
import { getMasogTotalSupply, getMasogBalance } from "./helpers";
import { discussionStatus, votingStatus, voteKey, acceptedStatus, rejectedStatus } from "./keys";
import { DISCUSSION_PERIOD, TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE, VOTING_PERIOD } from "./config";

/**
 * Calculates the timestamp when voting period begins for a proposal.
 * @param proposal - The proposal to calculate voting start time for
 * @returns The timestamp (u64) when voting starts
 */
export function getVotingStartTimestamp(proposal: Proposal): u64 {
  return proposal.creationTimestamp + DISCUSSION_PERIOD;
}

/**
 * Calculates the timestamp when voting period ends for a proposal.
 * @param proposal - The proposal to calculate voting end time for
 * @returns The timestamp (u64) when voting ends
 */
export function getVotingEndTimestamp(proposal: Proposal): u64 {
  return proposal.creationTimestamp + DISCUSSION_PERIOD + VOTING_PERIOD;
}

/**
 * Checks if the current timestamp falls within the proposal's voting period.
 * @param proposal - The proposal to check
 * @param currentTimestamp - Current blockchain timestamp
 * @returns Boolean indicating if voting period is active
 */
export function isInVotingPeriod(proposal: Proposal, currentTimestamp: u64): bool {
  const votingStart = getVotingStartTimestamp(proposal);
  const votingEnd = getVotingEndTimestamp(proposal);
  return currentTimestamp >= votingStart && currentTimestamp <= votingEnd;
}

/**
 * Checks if the voting period for a proposal has ended.
 * @param proposal - The proposal to check
 * @param currentTimestamp - Current blockchain timestamp
 * @returns Boolean indicating if voting period has ended
 */
export function hasVotingPeriodEnded(proposal: Proposal, currentTimestamp: u64): bool {
  return currentTimestamp > getVotingEndTimestamp(proposal);
}

/**
 * Updates a proposal's status based on the current timestamp.
 * Handles transitions from discussion to voting, and processes voting results.
 * @param proposal - The proposal to update
 * @param currentTimestamp - Current blockchain timestamp
 */
export function updateProposalStatus(proposal: Proposal, currentTimestamp: u64): void {

  const elapsedTime = currentTimestamp - proposal.creationTimestamp;

  // Still in discussion period
  if (elapsedTime < DISCUSSION_PERIOD) {
    generateEvent(`Checking proposal status of: ${proposal.id} - still in discussion period`);

    return;
  }

  // Transition to voting
  const currentStatus = bytesToString(proposal.status);
  if (currentStatus === bytesToString(discussionStatus) &&
    isInVotingPeriod(proposal, currentTimestamp)) {
    proposal.setStatus(votingStatus).save();
    generateEvent(`Checking proposal status of: ${proposal.id} - transitioned to voting status`);
    return;
  }

  // Process voting results
  if (currentStatus === bytesToString(votingStatus) &&
    hasVotingPeriodEnded(proposal, currentTimestamp)) {
    const allVotesKeys = Storage.getKeys(voteKey(proposal.id, ''));

    for (let i = 0; i < allVotesKeys.length; i++) {
      const userAddr = StaticArray.fromArray(allVotesKeys[i].slice(voteKey(proposal.id, '').length));
      const voteValue = bytesToI32(Storage.get(allVotesKeys[i]))

      const balance = getMasogBalance(bytesToString(userAddr));

      if (voteValue === 1) {
        proposal.positiveVoteVolume += balance;
      } else if (voteValue === 0) {
        proposal.blankVoteVolume += balance;
      } else if (voteValue === -1) {
        proposal.negativeVoteVolume += balance;
      }
    }

    const totalSupply = getMasogTotalSupply();

    const majority = totalSupply * TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE / 100;

    const status = proposal.positiveVoteVolume > majority ? acceptedStatus : rejectedStatus;

    generateEvent(`Checking proposal status of: ${proposal.id} - ${bytesToString(status)}`);

    proposal.setStatus(status).save();
  }
}