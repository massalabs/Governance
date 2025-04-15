/* eslint-disable camelcase */
import {
  strToBytes,
  SmartContract,
  Provider,
  PublicProvider,
  ReadSCOptions,
  Args,
  bytesToStr,
  U64,
  Operation,
  Mas,
} from "@massalabs/massa-web3";
import { U64_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64";
import { RollEntry } from "../serializable/RollEntry";
import { getContracts } from "../config";

export const ROLLS_TAG = strToBytes("ROLLS");
const RECORDED_CYCLES_TAG = strToBytes("RECORDED_CYCLES");
export const ORACLE_LAST_RECORDED_CYCLE = strToBytes("LAST_CYCLE");

export function recordedCycleKey(cycle: U64_t): Uint8Array {
  return new Uint8Array([...RECORDED_CYCLES_TAG, ...U64.toBytes(cycle)]);
}

export function rollKeyPrefix(cycle: U64_t): Uint8Array {
  return new Uint8Array([...ROLLS_TAG, ...U64.toBytes(cycle)]);
}

export function rollKey(cycle: U64_t, address: string): Uint8Array {
  return new Uint8Array([...rollKeyPrefix(cycle), ...strToBytes(address)]);
}

export class Oracle extends SmartContract {
  static async init(provider: Provider | PublicProvider): Promise<Oracle> {
    return new Oracle(provider, getContracts().oracle);
  }

  static async initPublic(publicProvider: PublicProvider): Promise<Oracle> {
    return new Oracle(publicProvider, getContracts().oracle);
  }

  async feedCycle(
    rollEntries: RollEntry[],
    cycle: U64_t,
    isLastBatch: boolean,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return await this.call(
      "feedCycle",
      new Args()
        .addSerializableObjectArray(rollEntries)
        .addU64(cycle)
        .addBool(isLastBatch),
      options
    );
  }

  async deleteCycle(
    cycle: U64_t,
    nbToDelete: bigint,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return await this.call(
      "deleteCycle",
      new Args().addU64(cycle).addU32(nbToDelete),
      options
    );
  }

  async getNbRolls(cycle: U64_t, address: string): Promise<U64_t> {
    const result = await this.provider.readStorage(this.address, [
      rollKey(cycle, address),
    ]);

    if (!result[0]) {
      return 0n;
    }
    return U64.fromBytes(result[0]);
  }

  async getNbRecordByCycle(cycle: U64_t, final = false): Promise<number> {
    const filter = rollKeyPrefix(cycle);

    const keys = await this.provider.getStorageKeys(
      this.address,
      filter,
      final
    );

    return keys.length;
  }

  async getRolls(
    cycle: U64_t,
    final = false,
    min?: number,
    max?: number
  ): Promise<
    {
      address: string;
      rolls: U64_t;
    }[]
  > {
    const filter = rollKeyPrefix(cycle);

    const keys = await this.provider.getStorageKeys(
      this.address,
      filter,
      final
    );

    const values = await this.provider.readStorage(
      this.address,
      keys.slice(min, max),
      final
    );

    return values.map((value, i) => ({
      address: bytesToStr(keys[i].slice(filter.length)),
      rolls: U64.fromBytes(value!),
    }));
  }

  async getRecordedCycles(): Promise<U64_t[]> {
    const result = await this.provider.getStorageKeys(
      this.address,
      RECORDED_CYCLES_TAG
    );

    return result.map((cycle) =>
      U64.fromBytes(cycle.slice(RECORDED_CYCLES_TAG.length))
    );
  }

  async getLastCycle(): Promise<U64_t> {
    const cycle = await this.provider.readStorage(this.address, [
      ORACLE_LAST_RECORDED_CYCLE,
    ]);

    if (!cycle[0] || cycle[0].length === 0) {
      return 0n;
    }

    return U64.fromBytes(cycle[0]);
  }

  async upgradeSC(bytecode: Uint8Array): Promise<Operation> {
    return this.call("upgradeSC", new Args().addUint8Array(bytecode));
  }

  async setMasOgAddress(
    masOgContract = getContracts().masOg
  ): Promise<Operation> {
    return this.call("setMasOgAddress", new Args().addString(masOgContract), {
      coins: Mas.fromString("1"),
    });
  }

  async getMasOgAddress(): Promise<string> {
    const result = await this.provider.readStorage(this.address, ["MASOG_KEY"]);

    if (!result[0]) {
      throw new Error("No masOg address found");
    }

    return bytesToStr(result[0]);
  }

  /**
 * Receives coins
 */
  async receiveCoins(coins: bigint, options?: ReadSCOptions): Promise<Operation> {
    return await this.call('receiveCoins', new Args(), {
      ...options,
      coins
    });
  }
}
