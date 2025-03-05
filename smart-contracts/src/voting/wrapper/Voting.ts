/* eslint-disable camelcase */
import {
  Provider,
  PublicProvider,
  SmartContract,
  Operation,
  Args,
  Mas,
} from '@massalabs/massa-web3';
import { contracts, getContracts } from '../../config';

export class Voting extends SmartContract {
  static async init(provider: Provider | PublicProvider): Promise<Voting> {
    return new Voting(provider, getContracts().governance);
  }

  static mainnet(provider: Provider | PublicProvider): Voting {
    return new Voting(provider, contracts.mainnet.governance);
  }

  static buildnet(provider: Provider | PublicProvider): Voting {
    return new Voting(provider, contracts.buildnet.governance);
  }

  static local(provider: Provider | PublicProvider, address?: string): Voting {
    return new Voting(
      provider,
      address ? address : contracts.buildnet.governance,
    );
  }

  static async deploy(
    provider: Provider,
    bytecode: Uint8Array,
    args: Args,
    options?: { coins?: bigint; fee?: bigint },
  ): Promise<Voting> {
    const contract = await SmartContract.deploy(
      provider,
      bytecode,
      args,
      options,
    );
    return new Voting(provider, contract.address);
  }

  async createProposal(
    title: string,
    description: string,
    votingPowerThreshold: bigint,
    options?: { coins?: bigint },
  ): Promise<Operation> {
    return this.call(
      'createProposal',
      new Args()
        .addString(title)
        .addString(description)
        .addU64(votingPowerThreshold),
      options,
    );
  }

  async vote(
    proposalId: bigint,
    voteInFavor: boolean,
    options?: { coins?: bigint },
  ): Promise<Operation> {
    return this.call(
      'vote',
      new Args().addU64(proposalId).addBool(voteInFavor),
      options,
    );
  }

  async refresh(options?: { coins?: bigint }): Promise<Operation> {
    return this.call('refresh', new Args(), options);
  }

  async getProposalResults(proposalId: bigint): Promise<any> {
    return this.read('getProposalResults', new Args().addU64(proposalId));
  }

  async setMasOgAddress(
    masOgContract = getContracts().masOg,
  ): Promise<Operation> {
    return this.call('setMasOgAddress', new Args().addString(masOgContract), {
      coins: Mas.fromString('1'),
    });
  }
}
