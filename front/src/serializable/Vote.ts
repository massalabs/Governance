/* eslint-disable camelcase */
import { Args, DeserializedResult, Serializable } from "@massalabs/massa-web3";
import { I32_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/i32";
import { U64_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64";

export class Vote implements Serializable<Vote> {
  constructor(public proposalId: U64_t = 0n, public value: I32_t = 0n) {}

  serialize(): Uint8Array {
    return new Args().addU64(this.proposalId).addI32(this.value).serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Vote> {
    const args = new Args(data, offset);

    this.proposalId = args.nextU64();
    this.value = args.nextI32();

    return { instance: this, offset: args.getOffset() };
  }
}
