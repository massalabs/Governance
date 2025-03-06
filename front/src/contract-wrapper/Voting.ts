/* eslint-disable camelcase */
import {
  SmartContract,
  Provider,
  PublicProvider,
  ReadSCOptions,
  Args,
  Operation,
  Mas,
} from "@massalabs/massa-web3";
import { Proposal } from "../serializable/Proposal";
import { Vote } from "../serializable/Vote";
import { contracts, getContracts } from "../config";

export type Upgradable = SmartContract & {
  upgradeSC: (
    bytecode: Uint8Array,
    options?: ReadSCOptions
  ) => Promise<Operation>;
};

export class Governance extends SmartContract implements Upgradable {
  static async init(provider: Provider | PublicProvider): Promise<Governance> {
    return new Governance(provider, getContracts().governance);
  }

  static mainnet(provider: Provider | PublicProvider): Governance {
    return new Governance(provider, contracts.mainnet.governance);
  }

  static buildnet(provider: Provider | PublicProvider): Governance {
    return new Governance(provider, contracts.buildnet.governance);
  }

  static local(provider: Provider | PublicProvider): Governance {
    return new Governance(provider, contracts.buildnet.governance);
  }

  /**
   * Submits a new proposal
   * @param proposal - The proposal to submit
   */
  async submitProposal(
    proposal: Proposal,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return await this.call(
      "submitUpdateProposal",
      new Args().addSerializable(proposal),
      {
        ...options,
        coins: Mas.fromString("1001"),
      }
    );
  }

  /**
   * Casts a vote on a proposal
   * @param vote - The vote to cast
   */
  async vote(vote: Vote, options?: ReadSCOptions): Promise<Operation> {
    return await this.call(
      "vote",
      new Args().addSerializableObjectArray([vote]),
      options
    );
  }

  /**
   * Refreshes proposal statuses
   */
  async refresh(options?: ReadSCOptions): Promise<Operation> {
    return await this.call("refresh", new Args(), options);
  }

  /**
   * Deletes a proposal (admin only)
   * @param proposalId - ID of the proposal to delete
   */
  async deleteProposal(
    proposalId: bigint,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return await this.call(
      "deleteProposal",
      new Args().addU64(proposalId),
      options
    );
  }

  /**
   * Sets the MASOG contract address (admin only)
   * @param masogAddress - Address of the MASOG contract
   */
  async setMasOgAddress(
    masogAddress: string = getContracts().masOg,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return await this.call(
      "setMasOgContract",
      new Args().addString(masogAddress),
      {
        ...options,
        coins: Mas.fromString("1"),
      }
    );
  }

  /**
   * Upgrades the contract bytecode (admin only)
   * @param bytecode - New contract bytecode
   */
  async upgradeSC(
    bytecode: Uint8Array,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return await this.call("upgradeSC", bytecode, options);
  }
}
