/* eslint-disable camelcase */
import {
  strToBytes,
  SmartContract,
  Provider,
  PublicProvider,
  ReadSCOptions,
  Args,
  bytesToStr,
  U32,
  Operation,
} from '@massalabs/massa-web3';
import { U32_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u32';
import { RollEntry } from '../serializable/RollEntry';

export const ORACLES_CONTRACTS = {
  mainnet: '',
  buildnet: 'AS1nJ4UTHvrqWgqe6gycgUcpQUDZkiEUsX4eYtx64wg5tUk2V2t6',
  local: 'AS1uYHPwXnQYTcY98BhfFnYg5gsp7oaHKD1orhm5zer1oegWUgQ',
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
    return new Oracle(provider, ORACLES_CONTRACTS.mainnet);
  }

  static buildnet(provider: Provider | PublicProvider): Oracle {
    return new Oracle(provider, ORACLES_CONTRACTS.buildnet);
  }

  static local(provider: Provider | PublicProvider): Oracle {
    return new Oracle(provider, ORACLES_CONTRACTS.local);
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

  async deleteCycle(
    cycle: U32_t,
    nbToDelete: bigint,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'deleteCycle',
      new Args().addU32(cycle).addI32(nbToDelete),
      options,
    );
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

  async upgradeSC(bytecode: Uint8Array): Promise<Operation> {
    return await this.call('upgradeSC', new Args().addUint8Array(bytecode));
  }
}
