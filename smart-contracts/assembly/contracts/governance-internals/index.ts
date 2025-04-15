import {
  bytesToU64,
  u64ToBytes,
  stringToBytes,
} from '@massalabs/as-types';
import {
  Storage,
  Context,
  getKeys,
} from '@massalabs/massa-as-sdk';
import { Proposal } from '../serializable/proposal';
import {
  discussionStatus,
  votingStatus,
  statusKeyPrefix,
  UPDATE_PROPOSAL_COUNTER_TAG,
  rejectedStatus,
} from './keys';
import { Vote } from '../serializable/vote';
import {
  assertSufficientMasogBalance,
  getMasogBalance,
  validateAndBurnMas,
} from './helpers';
import { isInVotingPeriod, updateProposalStatus } from './proposal-status';
import { MIN_PROPOSAL_MASOG_AMOUNT, MIN_PROPOSAL_MAS_AMOUNT, MIN_VOTE_MASOG_AMOUNT } from './config';
import { u256 } from 'as-bignum/assembly';
/**
/**
 * Submits a new proposal.
 * @param proposal - The proposal to be submitted.
 * @remarks This function validates the proposal, burns the required MAS amount, and stores the proposal.
 */
export function _submitProposal(proposal: Proposal): void {
  assertSufficientMasogBalance(
    getMasogBalance(Context.caller().toString()),
    MIN_PROPOSAL_MASOG_AMOUNT,
  );

  validateAndBurnMas(MIN_PROPOSAL_MAS_AMOUNT);

  const counter = bytesToU64(Storage.get(UPDATE_PROPOSAL_COUNTER_TAG));
  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(counter + 1));

  proposal.id = counter;
  proposal.owner = stringToBytes(Context.caller().toString());
  proposal.creationTimestamp = Context.timestamp();
  proposal.positiveVoteVolume = u256.fromU64(0);
  proposal.negativeVoteVolume = u256.fromU64(0);
  proposal.blankVoteVolume = u256.fromU64(0);
  proposal.endMasogTotalSupply = u256.fromU64(0);

  proposal.setStatus(discussionStatus).save();
}

/**
 * Refreshes the status of proposals based on the current timestamp.
 * @remarks This function moves proposals from discussion to votingStatus status
 * and from votingStatus to accepted or rejected status.
 */
export function _refresh(): void {
  const currentTimestamp = Context.timestamp();

  // Process discussion proposals
  const discussionProposalsKeys = getKeys(statusKeyPrefix(discussionStatus));
  for (let i = 0; i < discussionProposalsKeys.length; i++) {
    const id = StaticArray.fromArray(
      discussionProposalsKeys[i].slice(statusKeyPrefix(discussionStatus).length)
    );
    const proposal = Proposal.getById(bytesToU64(id));
    updateProposalStatus(proposal, currentTimestamp);
  }

  // Process voting proposals
  const votingProposalsKeys = getKeys(statusKeyPrefix(votingStatus));
  for (let i = 0; i < votingProposalsKeys.length; i++) {
    const id = StaticArray.fromArray(
      votingProposalsKeys[i].slice(statusKeyPrefix(votingStatus).length)
    );
    const proposal = Proposal.getById(bytesToU64(id));
    updateProposalStatus(proposal, currentTimestamp);
  }
}

/**
 * Casts a vote on a proposal.
 * @param vote - The vote to be cast.
 * @remarks This function validates the vote and updates the proposal's vote volumes accordingly.
 */
export function _vote(vote: Vote): void {
  const proposal = Proposal.getById(vote.proposalId);
  const currentTimestamp = Context.timestamp();

  assert(isInVotingPeriod(proposal, currentTimestamp), 'Voting is not allowed at this time');

  const balance = getMasogBalance(Context.caller().toString());
  assertSufficientMasogBalance(balance, MIN_VOTE_MASOG_AMOUNT);

  assert(vote.value === 1 || vote.value === 0 || vote.value === -1, 'Invalid vote value. Use 1 (yes), 0 (blank), or -1 (no)');

  vote.save();
}

/**
 * Deletes a proposal and all its associated data.
 * @param proposalId - The ID of the proposal to delete.
 */
export function _deleteProposal(proposalId: u64): void {
  const proposal = Proposal.getById(proposalId);
  assert(proposal.status.toString() === rejectedStatus.toString(), 'Proposal is not rejected');
  proposal.delete();
}

