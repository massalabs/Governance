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
  bytesToStr,
} from "@massalabs/massa-web3";
import { Proposal } from "../serializable/Proposal";
import { Vote } from "../serializable/Vote";
import { getContracts } from "../config";
import { I32_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/i32";
import { MasOg } from "./MasOg";
import { VoteDetails } from "@/types/governance";


const UPDATE_PROPOSAL_TAG = strToBytes("UPDATE_PROPOSAL_TAG");
const UPDATE_VOTE_TAG = strToBytes("UPDATE_VOTE_TAG");

export class Governance extends SmartContract {
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

    if (!values[0]) {
      return [];
    }

    return values.map((value) => {
      return I32.fromBytes(value!);
    });
  }

  async getVotesPower(proposalId: bigint, final = false): Promise<VoteDetails[]> {
    try {
      // Get storage keys for votes
      const voteKeyPrefix = new Uint8Array([
        ...UPDATE_VOTE_TAG,
        ...U64.toBytes(proposalId)
      ]);

      const keys = await this.provider.getStorageKeys(
        this.address,
        voteKeyPrefix,
        final
      );

      // Extract addresses from keys
      const addressOffset = UPDATE_VOTE_TAG.length + U64.toBytes(proposalId).length;
      const addresses = keys.map(key => key.slice(addressOffset));

      // Fetch storage values
      const values = await this.provider.readStorage(this.address, keys, final);

      // Map addresses to their vote values
      const votes: VoteDetails[] = values.map((value, index) => {
        if (!value) {
          throw new Error(`Missing value for address at index ${index}`);
        }
        return {
          address: bytesToStr(addresses[index]),
          value: I32.fromBytes(value),
          balance: 0n // Initialize balance
        };
      });

      // Get MasOg balances for voting power
      const masog = await MasOg.init(this.provider);
      const userBalances = await masog.balancesOf(votes.map(vote => vote.address));

      // Combine votes with their balances
      return votes.map(vote => {
        const balance = userBalances.find(b => b.address === vote.address)?.balance ?? 0n;
        return { ...vote, balance };
      });

    } catch (error) {
      console.error(`Failed to get votes power for proposal ${proposalId}:`, error);
      throw error; // Re-throw to allow caller to handle
    }
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

    return BigInt(keys.length);
  }

  /**
   * Manages the auto refresh
   * @param enable - Whether to enable or disable the auto refresh
   * @param maxGas - The maximum gas for the auto refresh
   * @param maxFee - The maximum fee for the auto refresh
   */
  async manageAutoRefresh(
    enable: boolean,
    maxGas: bigint,
    maxFee: bigint,
    options?: ReadSCOptions,
  ): Promise<Operation> {
    return await this.call('manageAutoRefresh', new Args().addBool(enable).addU64(maxGas).addU64(maxFee),
      options,
    );
  }
}
