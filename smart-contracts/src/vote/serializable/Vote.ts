/* eslint-disable camelcase */
import {
  Args,
  DeserializedResult,
  Serializable,
  U64,
} from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';

export class Vote implements Serializable<Vote> {
  constructor(
    public proposalId: U64_t,
    public vote: U64_t,
    public comment: string,
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addU64(this.proposalId)
      .addU64(this.vote)
      .addString(this.comment)
      .serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Vote> {
    const args = new Args(data, offset);

    this.proposalId = args.nextU64();
    this.vote = args.nextU64();
    this.comment = args.nextString();

    return { instance: this, offset: args.getOffset() };
  }
}
