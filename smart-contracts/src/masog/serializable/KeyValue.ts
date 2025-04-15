/* eslint-disable camelcase */
import {
  Args,
  DeserializedResult,
  Serializable,
} from '@massalabs/massa-web3';

export class KeyValue implements Serializable<KeyValue> {
  constructor(
    public key: Uint8Array = new Uint8Array(),
    public value: Uint8Array = new Uint8Array(),
  ) { }

  serialize(): Uint8Array {
    return new Args()
      .addUint8Array(this.key)
      .addUint8Array(this.value)
      .serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<KeyValue> {
    const args = new Args(data, offset);

    this.key = args.nextUint8Array();
    this.value = args.nextUint8Array();

    return { instance: this, offset: args.getOffset() };
  }
}
