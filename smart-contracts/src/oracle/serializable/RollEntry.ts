/* eslint-disable camelcase */
import {
  Args,
  DeserializedResult,
  Serializable,
  strToBytes,
  U64,
} from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';

export class RollEntry implements Serializable<RollEntry> {
  constructor(
    public address: Uint8Array = new Uint8Array(),
    public rolls: Uint8Array = new Uint8Array(),
  ) {}

  static create(address: string, rolls: U64_t): RollEntry {
    return new RollEntry(strToBytes(address), U64.toBytes(rolls));
  }

  serialize(): Uint8Array {
    return new Args()
      .addUint8Array(this.address)
      .addUint8Array(this.rolls)
      .serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<RollEntry> {
    const args = new Args(data, offset);

    this.address = args.nextUint8Array();
    this.rolls = args.nextUint8Array();

    return { instance: this, offset: args.getOffset() };
  }
}
