import { Serializable, Result } from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';

export class ManageAutoRefresh implements Serializable {
    constructor(
        public stop: bool = false,
        public maxGas: u64 = 0,
        public maxFee: u64 = 0,
    ) { }

    /**
     * Serializes the ManageAutoRefresh object into a byte array.  
     * @returns A byte array representing the serialized ManageAutoRefresh object.
     */
    serialize(): StaticArray<u8> {
        return new Args()
            .add(this.stop)
            .add(this.maxGas)
            .add(this.maxFee)
            .serialize();
    }

    /**
     * Deserializes a byte array into a ManageAutoRefresh object.
     * @param data - The byte array to deserialize.
     * @param offset - The offset to start deserialization from.
     * @returns A Result object containing the new offset or an error message.
     */
    deserialize(data: StaticArray<u8>, offset: u32): Result<u32> {
        const args = new Args(data, offset);

        const stop = args.nextBool().expect('stop is required');
        this.stop = stop;

        const maxGas = args.nextU64().expect('maxGas is required');
        this.maxGas = maxGas;

        const maxFee = args.nextU64().expect('maxFee is required');
        this.maxFee = maxFee;

        return new Result(args.offset);
    }
}
