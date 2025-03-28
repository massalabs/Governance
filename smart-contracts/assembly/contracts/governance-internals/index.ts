import {
  bytesToU64,
  u64ToBytes,
  stringToBytes,
  boolToByte,
} from '@massalabs/as-types';
import {
  Storage,
  Context,
  getKeys,
  asyncCall,
  currentPeriod,
  Slot,
} from '@massalabs/massa-as-sdk';
import { Proposal } from '../serializable/proposal';
import {
  acceptedStatus,
  discussionStatus,
  rejectedStatus,
  votingStatus,
  statusKeyPrefix,
  UPDATE_PROPOSAL_COUNTER_TAG,
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

// export const DISCUSSION_PERIOD = u64(3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
// export const VOTING_PERIOD = u64(4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds
export const DISCUSSION_PERIOD = u64(5 * 60 * 1000);
export const VOTING_PERIOD = u64(5 * 60 * 1000);

// Auto refresh constants
export const AUTO_REFRESH_STATUS_KEY = stringToBytes('auto_refresh');
export const LAST_REFETCH_PERIOD_TAG = stringToBytes('last_refetch_timestamp');
const START_REFETCH_PERIOD = 20;
const LIMIT_REFETCH_PERIOD = 40;

/**
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
  proposal.setStatus(discussionStatus).save();
}

/**
 * Refreshes the status of proposals based on the current timestamp.
 * @remarks This function moves proposals from discussion to votingStatus status
 * and from votingStatus to accepted or rejected status.
 */
export function _refresh(): void {
  const discussionProposalsKeys = getKeys(statusKeyPrefix(discussionStatus));
  const currentTimestamp = Context.timestamp();

  // First handle Discussion proposals
  for (let i = 0; i < discussionProposalsKeys.length; i++) {
    const id = StaticArray.fromArray(
      discussionProposalsKeys[i].slice(
        statusKeyPrefix(discussionStatus).length,
      ),
    );

    const proposal = Proposal.getById(bytesToU64(id));

    if (currentTimestamp - proposal.creationTimestamp >= DISCUSSION_PERIOD) {
      proposal.setStatus(votingStatus).save();
    }
  }

  // Then handle votingStatus proposals
  const votingStatusProposalsKeys = getKeys(statusKeyPrefix(votingStatus));
  const totalSupply = getMasogTotalSupply();

  if (votingStatusProposalsKeys.length == 0) return;

  for (let i = 0; i < votingStatusProposalsKeys.length; i++) {
    const id = StaticArray.fromArray(
      votingStatusProposalsKeys[i].slice(statusKeyPrefix(votingStatus).length),
    );

    const proposal = Proposal.getById(bytesToU64(id));

    if (currentTimestamp - proposal.creationTimestamp >= DISCUSSION_PERIOD + VOTING_PERIOD) {
      const majority = totalSupply / 2;
      if (proposal.positiveVoteVolume > majority) {
        proposal.setStatus(acceptedStatus).save();
      } else {
        proposal.setStatus(rejectedStatus).save();
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
    proposal.status.toString() === votingStatus.toString(),
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

/**
 * Refreshes the status of proposals based on the current timestamp.
 * @remarks This function moves proposals from discussion to votingStatus status
 * and from votingStatus to accepted or rejected status.
 */
export function _autoRefreshCall(): void {
  _assertAutoRefreshStatus();
  _refresh();
  Storage.set(LAST_REFETCH_PERIOD_TAG, u64ToBytes(Context.currentPeriod()));

  const currentPeriodStart = currentPeriod();
  const validityStartPeriod = currentPeriodStart + START_REFETCH_PERIOD;
  const validityStartThread = Context.currentThread();
  const validityEndPeriod = currentPeriodStart + LIMIT_REFETCH_PERIOD;
  const validityEndThread = Context.currentThread();

  // If no proposals in discussion or voting, we can stop the ASC
  const votingStatusProposalsKeys = getKeys(statusKeyPrefix(votingStatus));
  const discussionStatusProposalsKeys = getKeys(
    statusKeyPrefix(discussionStatus),
  );

  if (
    votingStatusProposalsKeys.length === 0 &&
    discussionStatusProposalsKeys.length === 0
  ) {
    return;
  }

  asyncCall(
    Context.callee(), // target
    'runAutoRefresh', // functionName
    new Slot(validityStartPeriod, validityStartThread), // startSlot
    new Slot(validityEndPeriod, validityEndThread), // endSlot
    1_000_000_000, // maxGas
    1_000, // rawFee
  );
  Storage.set(LAST_REFETCH_PERIOD_TAG, u64ToBytes(Context.currentPeriod()));
}

/**
 * Checks if the last refetch period is older than the current period + LIMIT_REFETCH_PERIOD
 * If it is, it calls the runAutoRefresh function
 */
export function _checkLastAutoRefresh(): void {
  const currentPeriod = Context.currentPeriod();

  if (!Storage.has(LAST_REFETCH_PERIOD_TAG)) {
    _autoRefreshCall();
    return;
  }

  const lastPeriod = bytesToU64(Storage.get(LAST_REFETCH_PERIOD_TAG));

  // Restart if beyond tolerance window
  if (currentPeriod > lastPeriod + LIMIT_REFETCH_PERIOD + 1) {
    _autoRefreshCall();
  }
}

/**
 * Asserts that the auto refresh status is enabled
 */
function _assertAutoRefreshStatus(): void {
  if (!Storage.has(AUTO_REFRESH_STATUS_KEY)) {
    Storage.set(AUTO_REFRESH_STATUS_KEY, boolToByte(true));
  }
  const autoRefreshStatus = Storage.get(AUTO_REFRESH_STATUS_KEY);
  assert(autoRefreshStatus, 'Auto refresh is disabled');
}
