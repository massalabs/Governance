import { stringToBytes, u64ToBytes } from '@massalabs/as-types';

export const UPDATE_PROPOSAL_COUNTER_TAG = stringToBytes(
  'UPDATE_PROPOSAL_COUNTER',
);
export const UPDATE_PROPOSAL_TAG = stringToBytes('UPDATE_PROPOSAL');
export const UPDATE_PROPOSAL_ID_BY_STATUS_TAG =
  stringToBytes('PROPOSAL_BY_STATUS');
export const UPDATE_VOTE_TAG = stringToBytes('VOTE');
export const UPDATE_VOTE_COMMENT_TAG = stringToBytes('VOTE_COMMENT');

export const discussion = stringToBytes('DISCUSSION');
export const voting = stringToBytes('VOTING');
export const accepted = stringToBytes('ACCEPTED');
export const rejected = stringToBytes('REJECTED');

/**
 * Constructs a key for a specific proposal attribute.
 * @param proposalId - The proposal ID.
 * @param tag - The attribute tag (e.g., OWNER_TAG, TITLE_TAG).
 * @returns The serialized key as StaticArray<u8>.
 */
export function proposalKey(proposalId: u64): StaticArray<u8> {
  return UPDATE_PROPOSAL_TAG.concat(u64ToBytes(proposalId));
}

export function statusKeyPrefix(status: StaticArray<u8>): StaticArray<u8> {
  return UPDATE_PROPOSAL_ID_BY_STATUS_TAG.concat(status);
}

/**
 * Constructs a key for the status index.
 * @param status - The status (e.g., "DISCUSSION", "VOTING").
 * @param proposalId - The proposal ID.
 * @returns The serialized key as StaticArray<u8>.
 */
export function statusKey(
  status: StaticArray<u8>,
  proposalId: u64,
): StaticArray<u8> {
  return statusKeyPrefix(status).concat(u64ToBytes(proposalId));
}

/**
 * Constructs a key for a vote.
 * @param proposalId - The proposal ID.
 * @param voterAddr - The voter’s address.
 * @returns The serialized key as StaticArray<u8>.
 */
export function voteKey(proposalId: u64, voterAddr: string): StaticArray<u8> {
  return UPDATE_VOTE_TAG.concat(u64ToBytes(proposalId)).concat(
    stringToBytes(voterAddr),
  );
}

/**
 * Constructs a key for a vote comment.
 * @param proposalId - The proposal ID.
 * @param voterAddr - The voter’s address.
 * @returns The serialized key as StaticArray<u8>.
 */
// TODO: Should we add a way to delete comments?
export function commentKey(
  proposalId: u64,
  voterAddr: string,
): StaticArray<u8> {
  return UPDATE_VOTE_COMMENT_TAG.concat(u64ToBytes(proposalId)).concat(
    stringToBytes(voterAddr),
  );
}
