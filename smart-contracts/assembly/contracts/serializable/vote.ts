import { Serializable, Result, i32ToBytes } from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';
import { Context, Storage } from '@massalabs/massa-as-sdk';
import { voteKey, commentKey } from '../voting-internals/keys';

export class Vote implements Serializable {
  constructor(
    public proposalId: u64 = 0,
    public value: i32 = 0,
    public comment: StaticArray<u8> = [],
  ) {}

  /**
   * Serializes the Proposal object into a byte array.
   */
  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.proposalId)
      .add(this.value)
      .add(this.comment)
      .serialize();
  }

  /**
   * Deserializes a byte array into a Proposal object.
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

    const comment = args.next<StaticArray<u8>>();
    if (comment.isErr()) return new Result(0, 'Error deserializing comment');
    this.comment = comment.unwrap();

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

    // Record the vote
    // TODO: SHould we add voting power (masog balance) at this moment of voting instead of just the vote value (1,0,-1)
    Storage.set(voteKeyBytes, i32ToBytes(this.value));

    if (this.comment.length > 0) {
      Storage.set(commentKey(this.proposalId, voterAddr), this.comment);
    }
  }
}
