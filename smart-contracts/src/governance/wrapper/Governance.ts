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
  strToBytes,
  U64,
  bytesToStr,
} from '@massalabs/massa-web3';
import { getContracts } from '../../config';

import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';
import { CLIENT_RENEG_LIMIT } from 'tls';

export type Upgradable = SmartContract & {
  upgradeSC: (
    bytecode: Uint8Array,
    options?: ReadSCOptions,
  ) => Promise<Operation>;
};

const ASC_END_PERIOD = strToBytes('ASC_END_PERIOD');
const UPDATE_PROPOSAL_ID_BY_STATUS_TAG = strToBytes('PROPOSAL_BY_STATUS_TAG');

const discussionStatusString = 'DISCUSSION';
const votingStatusString = 'VOTING';
export const discussionStatus = strToBytes(discussionStatusString);
export const votingStatus = strToBytes(votingStatusString);
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

  async isAscRunning(currentPeriod: U64_t): Promise<boolean> {
    const result = await this.provider.readStorage(this.address, [ASC_END_PERIOD]);
    const endPeriod = U64.fromBytes(result[0]);
    return currentPeriod > endPeriod;
  }

  async isProposalActive(): Promise<boolean> {
    const result = await this.provider.getStorageKeys(this.address, UPDATE_PROPOSAL_ID_BY_STATUS_TAG);
    const activeStatus = result.filter((status) => bytesToStr(status).includes(discussionStatusString) || bytesToStr(status).includes(votingStatusString));
    return activeStatus.length > 0;
  }
}