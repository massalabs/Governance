import { bytesToU64, u64ToBytes, stringToBytes } from '@massalabs/as-types';
import { Storage, Context, getKeys } from '@massalabs/massa-as-sdk';
import { Proposal } from '../serializable/proposal';
import {
  accepted,
  discussion,
  rejected,
  statusKeyPrefix,
  UPDATE_PROPOSAL_COUNTER_TAG,
  voting,
} from './keys';
import { Vote } from '../serializable/vote';
import {
  assertSufficientMasogBalance,
  getMasogBalance,
  getMasogTotalSupply,
  validateAndBurnMas,
} from './helpers';

const MIN_PROPOSAL_MAS_AMOUNT = u64(1000_000_000_000);
const MIN_PROPOSAL_MASOG_AMOUNT = u64(1000);
const MIN_VOTE_MASOG_AMOUNT = u64(1);
const DISCUSSION_PERIOD = u64(3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
const VOTING_PERIOD = u64(4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds

/**
 * Submits a new proposal.
 * @param proposal - The proposal to be submitted.
 * @remarks This function validates the proposal, burns the required MAS amount, and stores the proposal.
 */
export function _submitProposal(proposal: Proposal): void {
  assertSufficientMasogBalance(
    getMasogBalance(Context.caller()),
    MIN_PROPOSAL_MASOG_AMOUNT,
  );

  validateAndBurnMas(MIN_PROPOSAL_MAS_AMOUNT);

  const counter = bytesToU64(Storage.get(UPDATE_PROPOSAL_COUNTER_TAG));
  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(counter + 1));

  proposal.id = counter;
  proposal.owner = stringToBytes(Context.caller().toString());
  proposal.creationTimestamp = Context.timestamp();
  proposal.setStatus(discussion).save();
}

/**
 * Refreshes the status of proposals based on the current timestamp.
 * @remarks This function moves proposals from discussion to voting status
 * and from voting to accepted or rejected status.
 */
export function _refresh(): void {
  const discussionProposalsKeys = getKeys(statusKeyPrefix(discussion));
  const currentTimestamp = Context.timestamp();

  // First handle Discussion proposals
  for (let i = 0; i < discussionProposalsKeys.length; i++) {
    const id = StaticArray.fromArray(
      discussionProposalsKeys[i].slice(statusKeyPrefix(discussion).length),
    );

    const proposal = Proposal.getById(bytesToU64(id));

    if (currentTimestamp - proposal.creationTimestamp >= DISCUSSION_PERIOD) {
      proposal.setStatus(voting).save();
    }
  }

  // Then handle Voting proposals
  const votingProposalsKeys = getKeys(statusKeyPrefix(voting));
  const totalSupply = getMasogTotalSupply();

  if (votingProposalsKeys.length == 0) return;

  for (let i = 0; i < votingProposalsKeys.length; i++) {
    const id = StaticArray.fromArray(
      votingProposalsKeys[i].slice(statusKeyPrefix(voting).length),
    );

    const proposal = Proposal.getById(bytesToU64(id));

    if (currentTimestamp - proposal.creationTimestamp >= VOTING_PERIOD) {
      const majority = totalSupply / 2;
      if (proposal.positiveVoteVolume > majority) {
        proposal.setStatus(accepted).save();
      } else {
        proposal.setStatus(rejected).save();
      }
    }
  }
}

/**
 * Casts a vote on a proposal.
 * @param vote - The vote to be cast.
 * @remarks This function validates the vote and updates the proposal's vote volumes accordingly.
 */
export function _vote(vote: Vote): void {
  const proposal = Proposal.getById(vote.proposalId);

  assert(
    proposal.status.toString() === voting.toString(),
    'Proposal must be in VOTING status',
  );

  vote.save();

  const balance = getMasogBalance(Context.caller());
  assertSufficientMasogBalance(balance, MIN_VOTE_MASOG_AMOUNT);

  if (vote.value == 1) {
    proposal.positiveVoteVolume = proposal.positiveVoteVolume + balance;
  } else if (vote.value == 0) {
    proposal.blankVoteVolume = proposal.blankVoteVolume + balance;
  } else if (vote.value == -1) {
    proposal.negativeVoteVolume = proposal.negativeVoteVolume + balance;
  } else {
    assert(false, 'Invalid vote value. Use 1 (yes), 0 (blank), or -1 (no)');
  }

  proposal.save();
}

/**
 * Deletes a proposal and all its associated data.
 * @param proposalId - The ID of the proposal to delete.
 */
export function _deleteProposal(proposalId: u64): void {
  const proposal = Proposal.getById(proposalId);
  proposal.delete();
}
