/* eslint-disable camelcase */
import {
  Provider,
  PublicProvider,
  MRC20,
  Operation,
  Args,
  Mas,

  bytesToStr,
  U256,
} from '@massalabs/massa-web3';
import { getContracts } from '../../config';
import { KeyValue } from '../serializable/KeyValue';

export class MasOg extends MRC20 {
  static async init(provider: Provider | PublicProvider): Promise<MasOg> {
    return new MasOg(provider, getContracts().masOg);
  }

  async refresh(coins: bigint, maxCycles = 0n): Promise<Operation> {
    return this.call('refresh', new Args().addI32(maxCycles), { coins });
  }

  async upgradeSC(bytecode: Uint8Array): Promise<Operation> {
    return this.call('upgradeSC', bytecode, {
      coins: Mas.fromString('1'),
    });
  }

  async getAllBalances(): Promise<{ address: string; balance: bigint }[]> {
    const keys = await this.provider.getStorageKeys(this.address, "BALANCE");

    const values = await this.provider.readStorage(this.address, keys);

    return keys.map((key, index) => ({
      address: bytesToStr(key).split("BALANCE")[1],
      balance: U256.fromBytes(values[index]),
    }));
  }

  /**
   * Migrates the storage of the masOg contract.
   * @param keyValues - The key-value pairs to migrate.
   * @param coins - The amount of coins to use for the migration in smallest unit.
   * @returns The operation result.
   */
  async migrate(keyValues: KeyValue[], coins: bigint): Promise<Operation> {
    return this.call('migrate', new Args().addSerializableObjectArray(keyValues), {
      coins,
      fee: Mas.fromString('1'),
    });
  }

  // withdraw coins
  async withdrawCoins(amount: bigint): Promise<Operation> {
    return this.call('withdrawCoins', new Args().addI64(amount));
  }
}
