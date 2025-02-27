import {
  Serializable,
  Result,
  u64ToBytes,
  bytesToU64,
} from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';
import { Storage } from '@massalabs/massa-as-sdk';
import { UPDATE_PROPOSAL_COUNTER_TAG } from '../voting-internals/keys';

export class Proposal implements Serializable {
  constructor(
    public title: StaticArray<u8> = [],
    public forumPostLink: StaticArray<u8> = [],
    public summary: StaticArray<u8> = [],
    public parameterChange: StaticArray<u8> = [],
    public status: StaticArray<u8> = [],
    public owner: StaticArray<u8> = [],
    public creationTimestamp: StaticArray<u8> = [],
    public positiveVoteVolume: u64 = 0,
    public negativeVoteVolume: u64 = 0,
    public blankVoteVolume: u64 = 0,
  ) {}

  /**
   * Serializes the Proposal object into a byte array.
   */
  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.owner)
      .add(this.title)
      .add(this.summary)
      .add(this.forumPostLink)
      .add(this.parameterChange)
      .add(this.creationTimestamp)
      .add(this.positiveVoteVolume)
      .add(this.negativeVoteVolume)
      .add(this.blankVoteVolume)
      .add(this.status)
      .serialize();
  }

  /**
   * Deserializes a byte array into a Proposal object.
   */
  deserialize(data: StaticArray<u8>, offset: u32): Result<u32> {
    const args = new Args(data, offset);

    const owner = args.next<StaticArray<u8>>();
    if (owner.isErr()) return new Result(0, 'Error deserializing owner');
    this.owner = owner.unwrap();

    const title = args.next<StaticArray<u8>>();
    if (title.isErr()) return new Result(0, 'Error deserializing title');
    this.title = title.unwrap();

    const summary = args.next<StaticArray<u8>>();
    if (summary.isErr()) return new Result(0, 'Error deserializing summary');
    this.summary = summary.unwrap();

    const forumPostLink = args.next<StaticArray<u8>>();
    if (forumPostLink.isErr())
      return new Result(0, 'Error deserializing forumPostLink');
    this.forumPostLink = forumPostLink.unwrap();

    const parameterChange = args.next<StaticArray<u8>>();
    if (parameterChange.isErr())
      return new Result(0, 'Error deserializing parameterChange');
    this.parameterChange = parameterChange.unwrap();

    const creationTimestamp = args.next<StaticArray<u8>>();
    if (creationTimestamp.isErr())
      return new Result(0, 'Error deserializing creationTimestamp');
    this.creationTimestamp = creationTimestamp.unwrap();

    const positiveVoteVolume = args.next<u64>();
    if (positiveVoteVolume.isErr())
      return new Result(0, 'Error deserializing positiveVoteVolume');
    this.positiveVoteVolume = positiveVoteVolume.unwrap();

    const negativeVoteVolume = args.next<u64>();
    if (negativeVoteVolume.isErr())
      return new Result(0, 'Error deserializing negativeVoteVolume');
    this.negativeVoteVolume = negativeVoteVolume.unwrap();

    const blankVoteVolume = args.next<u64>();
    if (blankVoteVolume.isErr())
      return new Result(0, 'Error deserializing blankVoteVolume');
    this.blankVoteVolume = blankVoteVolume.unwrap();

    const status = args.next<StaticArray<u8>>();
    if (status.isErr()) return new Result(0, 'Error deserializing status');
    this.status = status.unwrap();

    return new Result(args.offset);
  }

  validate(): void {
    // TODO: Discuss validation needs
    assert(
      this.title.length > 0 &&
        this.summary.length > 0 &&
        this.forumPostLink.length > 0 &&
        this.parameterChange.length > 0,
      'Invalid proposal data',
    );
  }

  generateId(): u64 {
    const counter = Storage.get(UPDATE_PROPOSAL_COUNTER_TAG);
    const proposalId = bytesToU64(counter) + 1;

    Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(proposalId));

    return proposalId;
  }
}
