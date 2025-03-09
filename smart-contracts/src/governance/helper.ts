import { OutputEvents } from '@massalabs/massa-web3/dist/esm/generated/client-types';
import { Governance } from './wrapper/Governance';
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
 * @param governance - Governance contract instance
 * @param proposal - Proposal to submit
 */
export async function submitProposalAndWait(
  governance: Governance,
  proposal: Proposal,
) {
  const op = await governance.submitProposal(proposal);
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
 * @param governance - Governance contract instance
 * @param vote - Vote to cast
 */
export async function castVoteAndWait(governance: Governance, vote: Vote) {
  const op = await governance.vote(vote);
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
 * @param governance - Governance contract instance
 */
export async function refreshAndWait(governance: Governance) {
  const op = await governance.refresh();
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
 * @param governance - Governance contract instance
 * @param proposalId - ID of the proposal to delete
 */
export async function deleteProposalAndWait(
  governance: Governance,
  proposalId: bigint,
) {
  const op = await governance.deleteProposal(proposalId);
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
 * @param governance - Governance contract instance
 * @param masogAddress - Address of the MASOG contract
 */
export async function setMasOgAddressAndWait(
  governance: Governance,
  masogAddress: string,
) {
  const op = await governance.setMasOgAddress(masogAddress);
  const status = await op.waitFinalExecution();
  if (status !== OperationStatus.Success) {
    throw new Error('Failed to set MASOG address');
  }
  const events = await op.getFinalEvents();
  logEvents(events);
  return events;
}
