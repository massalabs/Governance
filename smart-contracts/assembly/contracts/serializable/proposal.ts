import { Serializable, Result } from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';
import { getKeys, Storage } from '@massalabs/massa-as-sdk';
import { proposalKey, statusKey, voteKey } from '../governance-internals/keys';

export class Proposal implements Serializable {
  constructor(
    public title: StaticArray<u8> = [],
    public forumPostLink: StaticArray<u8> = [],
    public summary: StaticArray<u8> = [],
    public parameterChange: StaticArray<u8> = [],
    public id: u64 = 0,
    public status: StaticArray<u8> = [],
    public owner: StaticArray<u8> = [],
    public creationTimestamp: u64 = 0,
    public positiveVoteVolume: u64 = 0,
    public negativeVoteVolume: u64 = 0,
    public blankVoteVolume: u64 = 0,
  ) { }

  /**
   * Serializes the Proposal object into a byte array.
   * @returns A byte array representing the serialized Proposal object.
   */
  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.title)
      .add(this.forumPostLink)
      .add(this.summary)
      .add(this.parameterChange)
      .add(this.id)
      .add(this.status)
      .add(this.owner)
      .add(this.creationTimestamp)
      .add(this.positiveVoteVolume)
      .add(this.negativeVoteVolume)
      .add(this.blankVoteVolume)
      .serialize();
  }

  /**
   * Deserializes a byte array into a Proposal object.
   * @param data - The byte array to deserialize.
   * @param offset - The offset to start deserialization from.
   * @returns A Result object containing the new offset or an error message.
   */
  deserialize(data: StaticArray<u8>, offset: u32): Result<u32> {
    const args = new Args(data, offset);

    const title = args.next<StaticArray<u8>>();
    if (title.isErr()) return new Result(0, 'Error deserializing title');
    this.title = title.unwrap();

    const forumPostLink = args.next<StaticArray<u8>>();
    if (forumPostLink.isErr())
      return new Result(0, 'Error deserializing forumPostLink');
    this.forumPostLink = forumPostLink.unwrap();

    const summary = args.next<StaticArray<u8>>();
    if (summary.isErr()) return new Result(0, 'Error deserializing summary');
    this.summary = summary.unwrap();

    const parameterChange = args.next<StaticArray<u8>>();
    if (parameterChange.isErr())
      return new Result(0, 'Error deserializing parameterChange');
    this.parameterChange = parameterChange.unwrap();

    const id = args.next<u64>();
    if (id.isErr()) return new Result(0, 'Error deserializing id');
    this.id = id.unwrap();

    const status = args.next<StaticArray<u8>>();
    if (status.isErr()) return new Result(0, 'Error deserializing status');
    this.status = status.unwrap();

    const owner = args.next<StaticArray<u8>>();
    if (owner.isErr()) return new Result(0, 'Error deserializing owner');
    this.owner = owner.unwrap();

    const creationTimestamp = args.next<u64>();
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

    return new Result(args.offset);
  }

  /**
   * Asserts that the proposal data is valid.
   */
  assertIsValid(): void {
    assert(
      this.title.length > 0 &&
      this.title.length <= 100 &&
      this.summary.length > 0 &&
      this.summary.length <= 500 &&
      this.forumPostLink.length > 0 &&
      this.forumPostLink.length <= 200 &&
      this.owner.length > 0 &&
      this.parameterChange.length > 0 &&
      this.parameterChange.length <= 500, "Invalid proposal data"
    );
  }

  /**
   * Sets the status of the proposal and updates the storage accordingly.
   * @param status - The new status of the proposal.
   * @returns The updated Proposal object.
   */
  // TODO: TO OPTIMIZE
  setStatus(status: StaticArray<u8>): Proposal {
    const previousStatus = this.status;
    // TODO: TO OPTIMIZE: It means we have the same info 2 times in the storage
    this.status = status;

    if (previousStatus.length > 0) {
      Storage.del(statusKey(previousStatus, this.id));
    }
    Storage.set(statusKey(status, this.id), []);

    return this;
  }

  /**
   * Saves the proposal to storage.
   */
  save(): void {
    this.assertIsValid();
    Storage.set(proposalKey(this.id), this.serialize());
  }

  /**
   * Deletes a proposal and all its associated data from storage.
   * Note: We intentionally keep the proposal counter (UPDATE_PROPOSAL_COUNTER_TAG)
   * to ensure new proposals get new IDs rather than reusing deleted ones.
   */
  delete(): void {
    // Delete the proposal data
    Storage.del(proposalKey(this.id));
    // Delete the status index
    Storage.del(statusKey(this.status, this.id));

    // Delete all votes
    const voteKeys = getKeys(voteKey(this.id, ''));
    for (let i = 0; i < voteKeys.length; i++) {
      Storage.del(voteKeys[i]);
    }
  }

  /**
   * Retrieves a proposal by its ID.
   * @param id - The ID of the proposal.
   * @returns The Proposal object.
   */
  static getById(id: u64): Proposal {
    const proposalKeyBytes = proposalKey(id);
    assert(Storage.has(proposalKeyBytes), `Proposal ${id} does not exist`);
    const proposalBytes = Storage.get(proposalKeyBytes);
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    return proposal;
  }
}
