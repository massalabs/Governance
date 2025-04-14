/* eslint-disable camelcase */
import {
  SmartContract,
  Provider,
  PublicProvider,
  ReadSCOptions,
  Args,
  Operation,
  Mas,
  OperationStatus,
} from '@massalabs/massa-web3';
import { getContracts } from '../../config';

export type Upgradable = SmartContract & {
  upgradeSC: (
    bytecode: Uint8Array,
    options?: ReadSCOptions,
  ) => Promise<Operation>;
};

export class Governance extends SmartContract implements Upgradable {
  static async init(provider: Provider | PublicProvider): Promise<Governance> {
    return new Governance(provider, getContracts().governance);
  }

  /**
   * Refreshes proposal statuses
   */
  async refresh(options?: ReadSCOptions): Promise<Operation> {
    return await this.call('refresh', new Args(), options);
  }

  /**
   * Sets the MASOG contract address (admin only)
   * @param masogAddress - Address of the MASOG contract
   */
  async setMasOgAddress(
    masogAddress: string = getContracts().masOg,
    options?: ReadSCOptions,
  ): Promise<void> {
    const op = await this.call(
      'setMasOgContract',
      new Args().addString(masogAddress),
      {
        ...options,
        coins: Mas.fromString('1'),
      },
    );

    const status = await op.waitFinalExecution();

    if (status !== OperationStatus.Success) {
      throw new Error('Failed to set MasOg address to governance');
    }
  }

  /**
   * Upgrades the contract bytecode (admin only)
   * @param bytecode - New contract bytecode
   */
  async upgradeSC(
    bytecode: Uint8Array,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call('upgradeSC', bytecode, options);
  }
}