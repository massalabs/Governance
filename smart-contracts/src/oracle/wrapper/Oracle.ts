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
  OperationStatus,
} from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';
import { RollEntry } from '../serializable/RollEntry';
import { getContracts } from '../../config';
import { KeyValue } from '../../masog/serializable/KeyValue';
import fs from 'fs';

export const ROLLS_TAG = strToBytes('ROLLS');
const RECORDED_CYCLES_TAG = strToBytes('RECORDED_CYCLES');
export const ORACLE_LAST_RECORDED_CYCLE = strToBytes('LAST_CYCLE');

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

  async feedCycle(
    rollEntries: RollEntry[],
    cycle: U64_t,
    isLastBatch: boolean,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'feedCycle',
      new Args()
        .addSerializableObjectArray(rollEntries)
        .addU64(cycle)
        .addBool(isLastBatch),
      options,
    );
  }

  async deleteCycle(
    cycle: U64_t,
    nbToDelete: bigint,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'deleteCycle',
      new Args().addU64(cycle).addU32(nbToDelete),
      options,
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

  async getNbRecordByCycle(cycle: U64_t, final = false): Promise<bigint> {
    const filter = rollKeyPrefix(cycle);

    const keys = await this.provider.getStorageKeys(
      this.address,
      filter,
      final,
    );

    return BigInt(keys.length);
  }

  async getRolls(
    cycle: U64_t,
    final = false,
    min?: number,
    max?: number,
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
      final,
    );

    const values = await this.provider.readStorage(
      this.address,
      keys.slice(min, max),
      final,
    );

    return values.map((value, i) => ({
      address: bytesToStr(keys[i].slice(filter.length)),
      rolls: U64.fromBytes(value!),
    }));
  }

  async getRecordedCycles(): Promise<U64_t[]> {
    const result = await this.provider.getStorageKeys(
      this.address,
      RECORDED_CYCLES_TAG,
    );

    return result.map((cycle) =>
      U64.fromBytes(cycle.slice(RECORDED_CYCLES_TAG.length)),
    );
  }

  async getAllStorageKeysAndSaveToFile(): Promise<void> {
    const result = await this.provider.getStorageKeys(
      this.address,
    );

    console.log(result.length);
    const keys = result.map((key) => {
      return {
        key: bytesToStr(key)
      };
    });

    fs.writeFileSync('storage_keys.json', JSON.stringify(keys, null, 2));
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
    return this.call('upgradeSC', bytecode, {
      coins: Mas.fromString('1'),
    });
  }

  async setMasOgAddress(
    masOgContract = getContracts().masOg,
  ): Promise<void> {
    const op = await this.call('setMasOgAddress', new Args().addString(masOgContract), {
      coins: Mas.fromString('1'),
    });

    const status = await op.waitFinalExecution();

    if (status !== OperationStatus.Success) {
      throw new Error('Failed to set MasOg address to oracle');
    }
  }

  async getMasOgAddress(): Promise<string> {
    const result = await this.provider.readStorage(this.address, ['MASOG_KEY']);

    if (!result[0]) {
      throw new Error('No masOg address found');
    }

    return bytesToStr(result[0]);
  }

  /**
   * Migrates the storage of the oracle contract.
   * @param keyValues - The key-value pairs to migrate.
   * @param coins - The amount of coins to use for the migration in smallest unit.
   * @returns The operation result.
   */
  async migrate(keyValues: KeyValue[], coins: bigint): Promise<Operation> {
    return this.call('migrate', new Args().addSerializableObjectArray(keyValues), {
      coins,
    });
  }

  async ownerAddress(): Promise<string> {
    const result = await this.provider.readSC({
      func: 'ownerAddress',
      target: this.address,
    });

    if (!result.value) {
      throw new Error('No owner address found');
    }
    return bytesToStr(result.value);
  }
}
