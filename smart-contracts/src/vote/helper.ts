import { OutputEvents } from '@massalabs/massa-web3/dist/esm/generated/client-types';
import { Voting } from './wrapper/Voting';
import { Proposal } from './serializable/Proposal';
import { Vote } from './serializable/Vote';
import { OperationStatus } from '@massalabs/massa-web3';

/**
 * Logs events to console
 * @param events - Array of output events to log
 */
export function logEvents(events: OutputEvents) {
  events.forEach((event) => console.log('Event message:', event.data));
}

/**
 * Submits a proposal and waits for final execution
 * @param voting - Voting contract instance
 * @param proposal - Proposal to submit
 */
export async function submitProposalAndWait(
  voting: Voting,
  proposal: Proposal,
) {
  const op = await voting.submitProposal(proposal);
  const status = await op.waitFinalExecution();
  if (status !== OperationStatus.Success) {
    throw new Error('Failed to submit proposal');
  }
  const events = await op.getFinalEvents();
  logEvents(events);
  return events;
}

/**
 * Casts a vote and waits for final execution
 * @param voting - Voting contract instance
 * @param vote - Vote to cast
 */
export async function castVoteAndWait(voting: Voting, vote: Vote) {
  const op = await voting.vote(vote);
  const status = await op.waitFinalExecution();
  if (status !== OperationStatus.Success) {
    throw new Error('Failed to cast vote');
  }
  const events = await op.getFinalEvents();
  logEvents(events);
  return events;
}

/**
 * Refreshes proposal statuses and waits for final execution
 * @param voting - Voting contract instance
 */
export async function refreshAndWait(voting: Voting) {
  const op = await voting.refresh();
  const status = await op.waitFinalExecution();
  if (status !== OperationStatus.Success) {
    throw new Error('Failed to refresh proposals');
  }
  const events = await op.getFinalEvents();
  logEvents(events);
  return events;
}

/**
 * Deletes a proposal and waits for final execution
 * @param voting - Voting contract instance
 * @param proposalId - ID of the proposal to delete
 */
export async function deleteProposalAndWait(
  voting: Voting,
  proposalId: bigint,
) {
  const op = await voting.deleteProposal(proposalId);
  const status = await op.waitFinalExecution();
  if (status !== OperationStatus.Success) {
    throw new Error('Failed to delete proposal');
  }
  const events = await op.getFinalEvents();
  logEvents(events);
  return events;
}

/**
 * Sets the MASOG contract address and waits for final execution
 * @param voting - Voting contract instance
 * @param masogAddress - Address of the MASOG contract
 */
export async function setMasOgAddressAndWait(
  voting: Voting,
  masogAddress: string,
) {
  const op = await voting.setMasOgAddress(masogAddress);
  const status = await op.waitFinalExecution();
  if (status !== OperationStatus.Success) {
    throw new Error('Failed to set MASOG address');
  }
  const events = await op.getFinalEvents();
  logEvents(events);
  return events;
}
