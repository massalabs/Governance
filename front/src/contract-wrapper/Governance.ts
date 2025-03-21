/* eslint-disable camelcase */
import {
  SmartContract,
  Provider,
  PublicProvider,
  ReadSCOptions,
  Args,
  Operation,
  Mas,
  strToBytes,
  U64,
  I32,
} from "@massalabs/massa-web3";
import { Proposal } from "../serializable/Proposal";
import { Vote } from "../serializable/Vote";
import { getContracts } from "../config";
import { I32_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/i32";

export type Upgradable = SmartContract & {
  upgradeSC: (
    bytecode: Uint8Array,
    options?: ReadSCOptions
  ) => Promise<Operation>;
};

const UPDATE_PROPOSAL_TAG = strToBytes("UPDATE_PROPOSAL_TAG");
const UPDATE_VOTE_TAG = strToBytes("UPDATE_VOTE_TAG");
const UPDATE_COUNTER_TAG = strToBytes("UPDATE_PROPOSAL_COUNTER");

export class Governance extends SmartContract implements Upgradable {
  static async init(provider: Provider | PublicProvider): Promise<Governance> {
    return new Governance(provider, getContracts().governance);
  }

  static async initPublic(publicProvider: PublicProvider): Promise<Governance> {
    return new Governance(publicProvider, getContracts().governance);
  }

  /**
   * Submits a new proposal
   * @param proposal - The proposal to submit
   */
  async submitProposal(
    proposal: Proposal,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return this.call(
      "submitUpdateProposal",
      new Args().addSerializable(proposal),
      {
        ...options,
        coins: Mas.fromString("1"),
      }
    );
  }

  /**
   * Casts a vote on a proposal
   * @param vote - The vote to cast
   */
  async vote(vote: Vote, options?: ReadSCOptions): Promise<Operation> {
    return this.call("vote", new Args().addSerializable(vote), {
      ...options,
    });
  }

  /**
   * Refreshes proposal statuses
   */
  async refresh(options?: ReadSCOptions): Promise<Operation> {
    return this.call("refresh", new Args(), options);
  }

  /**
   * Deletes a proposal (admin only)
   * @param proposalId - ID of the proposal to delete
   */
  async deleteProposal(
    proposalId: bigint,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return this.call("deleteProposal", new Args().addU64(proposalId), options);
  }

  /**
   * Sets the MASOG contract address (admin only)
   * @param masogAddress - Address of the MASOG contract
   */
  async setMasOgAddress(
    masogAddress: string = getContracts().masOg,
    options?: ReadSCOptions
  ): Promise<Operation> {
    return this.call("setMasOgContract", new Args().addString(masogAddress), {
      ...options,
      coins: Mas.fromString("1"),
    });
  }

  /**
   * Gets all proposals
   */
  async getProposals(final = false): Promise<Proposal[]> {
    const keys = await this.provider.getStorageKeys(
      this.address,
      UPDATE_PROPOSAL_TAG
    );

    const values = await this.provider.readStorage(this.address, keys, final);

    return values
      .filter((value) => value !== null && value.length > 0)
      .map((value) => {
        const proposal = new Proposal();
        proposal.deserialize(value as Uint8Array, 0);
        return proposal;
      });
  }

  /**
   * Gets a specific proposal by ID
   * @param proposalId - The ID of the proposal to get
   */
  async getProposal(proposalId: bigint, final = false): Promise<Proposal> {
    const key = new Uint8Array([
      ...UPDATE_PROPOSAL_TAG,
      ...U64.toBytes(proposalId),
    ]);

    const result = await this.provider.readStorage(this.address, [key], final);

    if (!result[0]) {
      throw new Error("Proposal not found");
    }

    const proposal = new Proposal();
    proposal.deserialize(result[0], 0);
    return proposal;
  }

  /**
   * Gets all votes for a specific proposal
   * @param proposalId - The ID of the proposal
   */
  async getVotes(proposalId: bigint, final = false): Promise<I32_t[]> {
    const keys = await this.provider.getStorageKeys(
      this.address,
      new Uint8Array([...UPDATE_VOTE_TAG, ...U64.toBytes(proposalId)]),
      final
    );

    const values = await this.provider.readStorage(this.address, keys, final);
    console.log("values", values);
    if (!values[0]) {
      return [];
    }

    return values.map((value) => {
      return I32.fromBytes(value!);
    });
  }

  /**
   * Gets all votes for a specific address
   * @param address - The address to get votes for
   */
  async getUserVotes(
    address: string,
    ids: bigint[],
    final = false
  ): Promise<{ id: bigint; value: bigint }[]> {
    const keys = await Promise.all(
      ids.map(
        (id) =>
          new Uint8Array([
            ...UPDATE_VOTE_TAG,
            ...U64.toBytes(id),
            ...strToBytes(address),
          ])
      )
    );

    const values = await this.provider.readStorage(this.address, keys, final);

    return values
      .map((value, index) => {
        if (value === null) {
          return null;
        }
        return { id: ids[index], value: I32.fromBytes(value) };
      })
      .filter((value) => value !== null);
  }

  /**
   * Get the number of total votes
   * @param proposalId - The ID of the proposal
   */
  async getTotalNbVotes(final = false): Promise<bigint> {
    const keys = await this.provider.getStorageKeys(
      this.address,
      UPDATE_VOTE_TAG,
      final
    );
    console.log(keys);

    return BigInt(keys.length);
  }

  /**
   * Get the counter of the proposal
   * @param proposalId - The ID of the proposal
   */
  async getCounter(final = false): Promise<bigint> {
    const result = await this.provider.readStorage(
      this.address,
      [UPDATE_COUNTER_TAG],
      final
    );

    if (!result[0]) {
      throw new Error("Counter not found");
    }

    return U64.fromBytes(result[0]);
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
