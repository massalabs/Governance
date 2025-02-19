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
} from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';
import { RollEntry } from '../serializable/RollEntry';

export const ORACLES_CONTRACTS = {
  mainnet: '',
  buildnet: 'AS1C2ThVh4MaZQsWuFCvJgw3yeh6T4NsM5pVCW7o2AaNkZuoiGJ8',
  local: 'AS1uYHPwXnQYTcY98BhfFnYg5gsp7oaHKD1orhm5zer1oegWUgQ',
};

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
  static mainnet(provider: Provider | PublicProvider): Oracle {
    return new Oracle(provider, ORACLES_CONTRACTS.mainnet);
  }

  static buildnet(provider: Provider | PublicProvider): Oracle {
    return new Oracle(provider, ORACLES_CONTRACTS.buildnet);
  }

  static local(provider: Provider | PublicProvider): Oracle {
    return new Oracle(provider, ORACLES_CONTRACTS.local);
  }

  async feedCycle(
    rollEntries: RollEntry[],
    isLastBatch: boolean,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'feedCycle',
      new Args().addSerializableObjectArray(rollEntries).addBool(isLastBatch),
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

    return U64.fromBytes(result[0]);
  }

  async getNbRecordedRolls(cycle: U64_t, final = false): Promise<number> {
    const filter = rollKeyPrefix(cycle);

    const keys = await this.provider.getStorageKeys(
      this.address,
      filter,
      final,
    );

    return keys.length;
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
      rolls: U64.fromBytes(value),
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

  async getLastCycle(): Promise<U64_t> {
    const cycle = await this.provider.readStorage(this.address, [
      ORACLE_LAST_RECORDED_CYCLE,
    ]);

    if (cycle[0].length === 0) {
      throw new Error('No cycle found');
    }

    return U64.fromBytes(cycle[0]);
  }

  async upgradeSC(bytecode: Uint8Array): Promise<Operation> {
    return await this.call('upgradeSC', new Args().addUint8Array(bytecode));
  }
}
