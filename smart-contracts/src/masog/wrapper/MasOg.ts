/* eslint-disable camelcase */
import {
  Provider,
  PublicProvider,
  MRC20,
  Operation,
  Args,
  Mas,
  ArrayTypes,
} from '@massalabs/massa-web3';
import { contracts, getContracts } from '../../config';
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
}
