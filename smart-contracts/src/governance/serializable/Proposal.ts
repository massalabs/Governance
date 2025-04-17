/* eslint-disable camelcase */
import {
  Args,
  DeserializedResult,
  Serializable,
  strToBytes,
} from '@massalabs/massa-web3';
import { U256_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u256';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';

export class Proposal implements Serializable<Proposal> {
  constructor(
    public title: Uint8Array = new Uint8Array(),
    public forumPostLink: Uint8Array = new Uint8Array(),
    public summary: Uint8Array = new Uint8Array(),
    public parameterChange: Uint8Array = new Uint8Array(),
    public id: U64_t = 0n,
    public status: Uint8Array = new Uint8Array(),
    public owner: Uint8Array = new Uint8Array(),
    public creationTimestamp: U64_t = 0n,
    public positiveVoteVolume: U256_t = 0n,
    public negativeVoteVolume: U256_t = 0n,
    public blankVoteVolume: U256_t = 0n,
    public endMasogTotalSupply: U256_t = 0n,
  ) { }

  static create(
    title: string,
    forumPostLink: string,
    summary: string,
    parameterChange: string,
    owner: string,
  ): Proposal {
    return new Proposal(
      strToBytes(title),
      strToBytes(forumPostLink),
      strToBytes(summary),
      strToBytes(parameterChange),
      0n,
      new Uint8Array(),
      strToBytes(owner),
      0n,
      0n,
      0n,
      0n,
    );
  }

  serialize(): Uint8Array {
    return new Args()
      .addUint8Array(this.title)
      .addUint8Array(this.forumPostLink)
      .addUint8Array(this.summary)
      .addUint8Array(this.parameterChange)
      .addU64(this.id)
      .addUint8Array(this.status)
      .addUint8Array(this.owner)
      .addU64(this.creationTimestamp)
      .addU256(this.positiveVoteVolume)
      .addU256(this.negativeVoteVolume)
      .addU256(this.blankVoteVolume)
      .addU256(this.endMasogTotalSupply)
      .serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Proposal> {
    const args = new Args(data, offset);

    this.title = args.nextUint8Array();
    this.forumPostLink = args.nextUint8Array();
    this.summary = args.nextUint8Array();
    this.parameterChange = args.nextUint8Array();
    this.id = args.nextU64();
    this.status = args.nextUint8Array();
    this.owner = args.nextUint8Array();
    this.creationTimestamp = args.nextU64();
    this.positiveVoteVolume = args.nextU256();
    this.negativeVoteVolume = args.nextU256();
    this.blankVoteVolume = args.nextU256();
    this.endMasogTotalSupply = args.nextU256();
    return { instance: this, offset: args.getOffset() };
  }
}
