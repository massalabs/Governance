/* eslint-disable camelcase */
import { Args, DeserializedResult, Serializable } from "@massalabs/massa-web3";
import { U64_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64";

export class ManageAutoRefresh implements Serializable<ManageAutoRefresh> {
    constructor(public stop: boolean = false, public maxGas: U64_t = 0n, public maxFee: U64_t = 0n) { }

    serialize(): Uint8Array {
        return new Args().addBool(this.stop).addU64(this.maxGas).addU64(this.maxFee).serialize();
    }

    deserialize(data: Uint8Array, offset: number): DeserializedResult<ManageAutoRefresh> {
        const args = new Args(data, offset);

        this.stop = args.nextBool();
        this.maxGas = args.nextU64();
        this.maxFee = args.nextU64();

        return { instance: this, offset: args.getOffset() };
    }
}
