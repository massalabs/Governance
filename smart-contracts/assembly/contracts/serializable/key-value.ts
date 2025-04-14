import { Serializable, Result } from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';

export class KeyValue implements Serializable {
    constructor(
        public key: StaticArray<u8> = [],
        public value: StaticArray<u8> = [],
    ) { }

    /**
     * Serializes the Proposal object into a byte array.
     * @returns A byte array representing the serialized Proposal object.
     */
    serialize(): StaticArray<u8> {
        return new Args()
            .add(this.key)
            .add(this.value)
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

        const key = args.next<StaticArray<u8>>();
        if (key.isErr()) return new Result(0, 'Error deserializing key');
        this.key = key.unwrap();

        const value = args.next<StaticArray<u8>>();
        if (value.isErr()) return new Result(0, 'Error deserializing value');
        this.value = value.unwrap();

        return new Result(args.offset);
    }
}
