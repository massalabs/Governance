/* eslint-disable camelcase */
import {
  strToBytes,
  SmartContract,
  Provider,
  PublicProvider,
  ReadSCOptions,
  Args,
  Operation,
  Mas,
} from '@massalabs/massa-web3';
import { Proposal } from '../serializable/Proposal';
import { Vote } from '../serializable/Vote';
import { contracts, getContracts } from '../../config';

export type Upgradable = SmartContract & {
  upgradeSC: (
    bytecode: Uint8Array,
    options?: ReadSCOptions,
  ) => Promise<Operation>;
};

export class Voting extends SmartContract implements Upgradable {
  static async init(provider: Provider | PublicProvider): Promise<Voting> {
    return new Voting(provider, getContracts().voting);
  }

  static mainnet(provider: Provider | PublicProvider): Voting {
    return new Voting(provider, contracts.mainnet.voting);
  }

  static buildnet(provider: Provider | PublicProvider): Voting {
    return new Voting(provider, contracts.buildnet.voting);
  }

  static local(provider: Provider | PublicProvider): Voting {
    return new Voting(provider, contracts.buildnet.voting);
  }

  /**
   * Submits a new proposal
   * @param proposal - The proposal to submit
   */
  async submitProposal(
    proposal: Proposal,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'submitUpdateProposal',
      new Args().addSerializable(proposal),
      {
        ...options,
        coins: Mas.fromString('1001'),
      },
    );
  }

  /**
   * Casts a vote on a proposal
   * @param vote - The vote to cast
   */
  async vote(vote: Vote, options?: ReadSCOptions): Promise<Operation> {
    return await this.call(
      'vote',
      new Args().addSerializableObjectArray([vote]),
      options,
    );
  }

  /**
   * Refreshes proposal statuses
   */
  async refresh(options?: ReadSCOptions): Promise<Operation> {
    return await this.call('refresh', new Args(), options);
  }

  /**
   * Deletes a proposal (admin only)
   * @param proposalId - ID of the proposal to delete
   */
  async deleteProposal(
    proposalId: bigint,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'deleteProposal',
      new Args().addU64(proposalId),
      options,
    );
  }

  /**
   * Sets the MASOG contract address (admin only)
   * @param masogAddress - Address of the MASOG contract
   */
  async setMasOgAddress(
    masogAddress: string = getContracts().masOg,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call(
      'setMasOgContract',
      new Args().addString(masogAddress),
      {
        ...options,
        coins: Mas.fromString('1'),
      },
    );
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
