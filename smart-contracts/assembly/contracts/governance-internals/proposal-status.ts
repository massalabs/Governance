import { bytesToI32, bytesToString } from '@massalabs/as-types';
import {
  generateEvent,
  getKeysPage,
  MAX_DATASTORE_KEYS_PAGE,
  Storage,
} from '@massalabs/massa-as-sdk';

import { Proposal } from '../serializable/proposal';
import { getMasogTotalSupply, getMasogBalance } from './helpers';
import {
  discussionStatus,
  votingStatus,
  voteKey,
  acceptedStatus,
  rejectedStatus,
} from './keys';
import {
  DISCUSSION_PERIOD,
  TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE,
  VOTING_PERIOD,
} from './config';
import { u256 } from 'as-bignum/assembly';

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
export function isInVotingPeriod(
  proposal: Proposal,
  currentTimestamp: u64,
): bool {
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
export function hasVotingPeriodEnded(
  proposal: Proposal,
  currentTimestamp: u64,
): bool {
  return currentTimestamp > getVotingEndTimestamp(proposal);
}

/**
 * Updates a proposal's status based on the current timestamp.
 * Handles transitions from discussion to voting, and processes voting results.
 * @param proposal - The proposal to update
 * @param currentTimestamp - Current blockchain timestamp
 */
export function updateProposalStatus(
  proposal: Proposal,
  currentTimestamp: u64,
): void {
  const elapsedTime = currentTimestamp - proposal.creationTimestamp;

  // Still in discussion period
  if (elapsedTime < DISCUSSION_PERIOD) {
    generateEvent(
      `Checking proposal status of: ${proposal.id} - still in discussion period`,
    );

    return;
  }

  // Transition to voting
  const currentStatus = bytesToString(proposal.status);
  if (
    currentStatus === bytesToString(discussionStatus) &&
    isInVotingPeriod(proposal, currentTimestamp)
  ) {
    proposal.setStatus(votingStatus).save();
    generateEvent(
      `Checking proposal status of: ${proposal.id} - transitioned to voting status`,
    );
    return;
  }

  // Process voting results
  if (
    currentStatus === bytesToString(votingStatus) &&
    hasVotingPeriodEnded(proposal, currentTimestamp)
  ) {
    // From MIP-0002, one datastore-key call returns at most MAX_DATASTORE_KEYS_PAGE keys: count the
    // votes one page at a time.
    const votesPrefix = voteKey(proposal.id, '');
    let votesKeys = getKeysPage(votesPrefix);
    while (votesKeys.length > 0) {
      for (let i = 0; i < votesKeys.length; i++) {
        const userAddr = StaticArray.fromArray(
          votesKeys[i].slice(votesPrefix.length),
        );
        const voteValue = bytesToI32(Storage.get(votesKeys[i]));

        const balance = getMasogBalance(bytesToString(userAddr));

        if (voteValue === 1) {
          proposal.positiveVoteVolume = u256.add(
            proposal.positiveVoteVolume,
            balance,
          );
        } else if (voteValue === 0) {
          proposal.blankVoteVolume = u256.add(
            proposal.blankVoteVolume,
            balance,
          );
        } else if (voteValue === -1) {
          proposal.negativeVoteVolume = u256.add(
            proposal.negativeVoteVolume,
            balance,
          );
        }
      }
      if (votesKeys.length < MAX_DATASTORE_KEYS_PAGE) {
        break;
      }
      // Exclusive cursor: the next page starts after the last vote read.
      votesKeys = getKeysPage(votesPrefix, votesKeys[votesKeys.length - 1]);
    }

    const totalSupply = getMasogTotalSupply();

    const status =
      u256.mul(proposal.positiveVoteVolume, u256.fromU64(100)) >
      u256.mul(totalSupply, TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE)
        ? acceptedStatus
        : rejectedStatus;

    proposal.endMasogTotalSupply = totalSupply;

    generateEvent(
      `Checking proposal status of: ${proposal.id} - ${bytesToString(status)}`,
    );

    proposal.setStatus(status).save();
  }
}
