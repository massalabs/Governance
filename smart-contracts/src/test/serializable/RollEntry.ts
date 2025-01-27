/* eslint-disable camelcase */
import { Args, DeserializedResult, Serializable } from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';

export class RollEntry implements Serializable<RollEntry> {
  constructor(public address: string = '', public rolls: U64_t = 0n) {}

  serialize(): Uint8Array {
    return new Args().addString(this.address).addU64(this.rolls).serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<RollEntry> {
    const args = new Args(data, offset);

    this.address = args.nextString();
    this.rolls = args.nextU64();

    return { instance: this, offset: args.getOffset() };
  }
}
