import { Serializable, Result, i32ToBytes } from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';
import { Context, Storage } from '@massalabs/massa-as-sdk';
import { voteKey } from '../governance-internals/keys';

export class Vote implements Serializable {
  constructor(public proposalId: u64 = 0, public value: i32 = 0) { }

  /**
   * Serializes the Vote object into a byte array.
   */
  serialize(): StaticArray<u8> {
    return new Args().add(this.proposalId).add(this.value).serialize();
  }

  /**
   * Deserializes a byte array into a Vote object.
   */
  deserialize(data: StaticArray<u8>, offset: u32): Result<u32> {
    const args = new Args(data, offset);

    const proposalId = args.next<u64>();
    if (proposalId.isErr())
      return new Result(0, 'Error deserializing proposalId');
    this.proposalId = proposalId.unwrap();

    const value = args.next<i32>();
    if (value.isErr()) return new Result(0, 'Error deserializing value');
    this.value = value.unwrap();

    return new Result(args.offset);
  }

  save(): void {
    // Check if voter has already voted
    const voterAddr = Context.caller().toString();
    const voteKeyBytes = voteKey(this.proposalId, voterAddr);
    assert(
      !Storage.has(voteKeyBytes),
      'Voter has already cast a vote for this proposal',
    );

    Storage.set(voteKeyBytes, i32ToBytes(this.value));
  }
}
