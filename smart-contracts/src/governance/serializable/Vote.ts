/* eslint-disable camelcase */
import { Args, DeserializedResult, Serializable } from '@massalabs/massa-web3';
import { I32_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/i32';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';

export class Vote implements Serializable<Vote> {
  constructor(
    public proposalId: U64_t = 0n,
    public value: I32_t = 0n,
    public comment: Uint8Array = new Uint8Array(),
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addU64(this.proposalId)
      .addI32(this.value)
      .addUint8Array(this.comment)
      .serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Vote> {
    const args = new Args(data, offset);

    this.proposalId = args.nextU64();
    this.value = args.nextI32();
    this.comment = args.nextUint8Array();

    return { instance: this, offset: args.getOffset() };
  }
}
