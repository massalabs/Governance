import { Args, stringToBytes, u64ToBytes } from '@massalabs/as-types';
import { RollEntry } from '../contracts/serializable/roll-entry';
import { mockScCall } from '@massalabs/massa-as-sdk';
import { Proposal } from '../contracts/serializable/proposal';
import { Vote } from '../contracts/serializable/vote';

export function getRollsArgs(
  rollData: RollEntry[],
  cycle: u64,
  isLastBatch: boolean = true,
): StaticArray<u8> {
  return new Args()
    .addSerializableObjectArray<RollEntry>(rollData)
    .add(cycle)
    .add(isLastBatch)
    .serialize();
}

export function mockMasogBalance(balance: u64): void {
  mockScCall(u64ToBytes(balance));
}

export function mockMasogTotalSupply(supply: u64): void {
  mockScCall(u64ToBytes(supply));
}

export function generateProposal(
  title: string,
  forumPostLink: string,
  summary: string,
  parameterChange: string,
): Proposal {
  return new Proposal(
    stringToBytes(title),
    stringToBytes(forumPostLink),
    stringToBytes(summary),
    stringToBytes(parameterChange),
  );
}

export function generateVote(proposalId: u64, value: i32): Vote {
  return new Vote(proposalId, value);
}
