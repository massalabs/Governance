/* eslint-disable camelcase */
import {
  strToBytes,
  SmartContract,
  Provider,
  PublicProvider,
  checkNetwork,
  ReadSCOptions,
  Args,
  bytesToStr,
  U32,
  Operation,
} from '@massalabs/massa-web3';
import { U32_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u32';
import { RollEntry } from '../serializable/RollEntry';

export const MNS_CONTRACTS = {
  mainnet: '',
  buildnet: 'AS1zVWLkKGpjw6JdbZAWE9VQH28s1E51KjvqVuW2GBZQ1WKcGWKg',
};

export const ROLLS_TAG = strToBytes('ROLLS');
const RECORDED_CYCLES_TAG = strToBytes('RECORDED_CYCLES');
export const LAST_CYCLE_TAG = strToBytes('LAST_CYCLE');

export function recordedCycleKey(cycle: U32_t): Uint8Array {
  return new Uint8Array([...RECORDED_CYCLES_TAG, ...U32.toBytes(cycle)]);
}

export function rollKeyPrefix(cycle: U32_t): Uint8Array {
  return new Uint8Array([...ROLLS_TAG, ...U32.toBytes(cycle)]);
}

export function rollKey(cycle: U32_t, address: string): Uint8Array {
  return new Uint8Array([...rollKeyPrefix(cycle), ...strToBytes(address)]);
}

export class Oracle extends SmartContract {
  static mainnet(provider: Provider | PublicProvider): Oracle {
    checkNetwork(provider, true);
    return new Oracle(provider, MNS_CONTRACTS.mainnet);
  }

  static buildnet(provider: Provider | PublicProvider): Oracle {
    checkNetwork(provider, false);
    return new Oracle(provider, MNS_CONTRACTS.buildnet);
  }

  async feedCycle(
    cycle: U32_t,
    rollEntries: RollEntry[],
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'feedCycle',
      new Args().addU32(cycle).addSerializableObjectArray(rollEntries),
      options,
    );
  }

  async deleteCycle(cycle: U32_t, options?: ReadSCOptions): Promise<Operation> {
    return await this.call('deleteCycle', new Args().addU32(cycle), options);
  }

  async getNbRolls(cycle: U32_t, address: string): Promise<U32_t> {
    const result = await this.provider.readStorage(this.address, [
      rollKey(cycle, address),
    ]);

    return U32.fromBytes(result[0]);
  }

  async getNbRecordedRolls(cycle: U32_t, final = false): Promise<number> {
    const filter = rollKeyPrefix(cycle);

    const keys = await this.provider.getStorageKeys(
      this.address,
      filter,
      final,
    );

    return keys.length;
  }

  async getRolls(
    cycle: U32_t,
    final = false,
    min?: number,
    max?: number,
  ): Promise<
    {
      address: string;
      rolls: U32_t;
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
      rolls: U32.fromBytes(value),
    }));
  }

  async getRecordedCycles(): Promise<U32_t[]> {
    const result = await this.provider.getStorageKeys(
      this.address,
      RECORDED_CYCLES_TAG,
    );

    return result.map((cycle) =>
      U32.fromBytes(cycle.slice(RECORDED_CYCLES_TAG.length)),
    );
  }

  async getLastCycle(): Promise<U32_t> {
    const cycle = await this.provider.readStorage(this.address, [
      LAST_CYCLE_TAG,
    ]);

    return U32.fromBytes(cycle[0]);
  }
}
