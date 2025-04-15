import { Proposal } from '../contracts/serializable/proposal';
import { resetStorage } from '@massalabs/massa-as-sdk';
import { stringToBytes } from '@massalabs/as-types';
import { u256 } from 'as-bignum/assembly';
describe('Proposal', () => {
  beforeEach(() => {
    resetStorage();
  });

  describe('constructor', () => {
    it('should create a new proposal with default values', () => {
      const proposal = new Proposal();
      expect(proposal.title.length).toBe(0);
      expect(proposal.forumPostLink.length).toBe(0);
      expect(proposal.summary.length).toBe(0);
      expect(proposal.parameterChange.length).toBe(0);
      expect(proposal.id).toBe(0);
      expect(proposal.status.length).toBe(0);
      expect(proposal.owner.length).toBe(0);
      expect(proposal.creationTimestamp).toBe(0);
      expect(proposal.positiveVoteVolume).toBe(u256.Zero);
      expect(proposal.negativeVoteVolume).toBe(u256.Zero);
      expect(proposal.blankVoteVolume).toBe(u256.Zero);
    });
    it('should create a proposal with provided values', () => {
      const title = stringToBytes('Test Proposal');
      const forumPostLink = stringToBytes('https://forum.example.com/1');
      const summary = stringToBytes('Test summary');
      const parameterChange = stringToBytes('{}');
      const status = stringToBytes('DRAFT');
      const owner = stringToBytes('owner123');
      const proposal = new Proposal(
        title,
        forumPostLink,
        summary,
        parameterChange,
        1,
        status,
        owner,
        1000,
        u256.fromU64(10),
        u256.fromU64(5),
        u256.fromU64(2),
      );
      expect(proposal.title).toStrictEqual(title);
      expect(proposal.forumPostLink).toStrictEqual(forumPostLink);
      expect(proposal.summary).toStrictEqual(summary);
      expect(proposal.parameterChange).toStrictEqual(parameterChange);
      expect(proposal.id).toBe(1);
      expect(proposal.status).toStrictEqual(status);
      expect(proposal.owner).toStrictEqual(owner);
      expect(proposal.creationTimestamp).toBe(1000);
      expect(proposal.positiveVoteVolume).toBe(u256.fromU64(10));
      expect(proposal.negativeVoteVolume).toBe(u256.fromU64(5));
      expect(proposal.blankVoteVolume).toBe(u256.fromU64(2));
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const title = stringToBytes('Test Proposal');
      const forumPostLink = stringToBytes('https://forum.example.com/1');
      const summary = stringToBytes('Test summary');
      const parameterChange = stringToBytes('{}');
      const status = stringToBytes('DRAFT');
      const owner = stringToBytes('owner123');

      const originalProposal = new Proposal(
        title,
        forumPostLink,
        summary,
        parameterChange,
        1,
        status,
        owner,
        1000,
        u256.fromU64(10),
        u256.fromU64(5),
        u256.fromU64(2),
      );

      const serialized = originalProposal.serialize();
      const deserializedProposal = new Proposal();
      deserializedProposal.deserialize(serialized, 0);

      expect(deserializedProposal.title).toStrictEqual(originalProposal.title);
      expect(deserializedProposal.forumPostLink).toStrictEqual(
        originalProposal.forumPostLink,
      );
      expect(deserializedProposal.summary).toStrictEqual(
        originalProposal.summary,
      );
      expect(deserializedProposal.parameterChange).toStrictEqual(
        originalProposal.parameterChange,
      );
      expect(deserializedProposal.id).toBe(originalProposal.id);
      expect(deserializedProposal.status).toStrictEqual(
        originalProposal.status,
      );
      expect(deserializedProposal.owner).toStrictEqual(originalProposal.owner);
      expect(deserializedProposal.creationTimestamp).toBe(
        originalProposal.creationTimestamp,
      );
      expect(deserializedProposal.positiveVoteVolume).toBe(
        originalProposal.positiveVoteVolume,
      );
      expect(deserializedProposal.negativeVoteVolume).toBe(
        originalProposal.negativeVoteVolume,
      );
      expect(deserializedProposal.blankVoteVolume).toBe(
        originalProposal.blankVoteVolume,
      );
    });
  });

  describe('validation', () => {
    it('should pass validation with valid data', () => {
      const proposal = new Proposal(
        stringToBytes('Test Proposal'),
        stringToBytes('https://forum.example.com/1'),
        stringToBytes('Test summary'),
        stringToBytes('{}'),
      );
      proposal.assertIsValid();
    });

    throws('should throw error with invalid data', () => {
      const proposal = new Proposal();
      proposal.assertIsValid();
    });
  });
});
