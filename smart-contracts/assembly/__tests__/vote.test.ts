import { Vote } from '../contracts/serializable/vote';
import { Storage } from '@massalabs/massa-as-sdk';
import { voteKey, commentKey } from '../contracts/governance-internals/keys';
import { stringToBytes } from '@massalabs/as-types';

describe('Vote', () => {
  beforeEach(() => {
    // Clear storage by deleting all keys
    const keys = Storage.getKeys();
    for (let i = 0; i < keys.length; i++) {
      Storage.del(keys[i]);
    }
  });

  describe('constructor', () => {
    it('should create a new vote with default values', () => {
      const vote = new Vote();
      expect(vote.proposalId).toBe(0);
      expect(vote.value).toBe(0);
      expect(vote.comment.length).toBe(0);
    });

    it('should create a vote with provided values', () => {
      const comment = stringToBytes('Test comment');
      const vote = new Vote(1, 1, comment);

      expect(vote.proposalId).toBe(1);
      expect(vote.value).toBe(1);
      expect(vote.comment).toStrictEqual(comment);
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const comment = stringToBytes('Test comment');
      const originalVote = new Vote(1, 1, comment);

      const serialized = originalVote.serialize();
      const deserializedVote = new Vote();
      deserializedVote.deserialize(serialized, 0);

      expect(deserializedVote.proposalId).toBe(originalVote.proposalId);
      expect(deserializedVote.value).toBe(originalVote.value);
      expect(deserializedVote.comment).toStrictEqual(originalVote.comment);
    });
  });

  describe('validation', () => {
    it('should pass validation with valid comment length', () => {
      const comment = stringToBytes('Test comment');
      const vote = new Vote(1, 1, comment);
      expect(() => vote.assertIsValid()).not.toThrow();
    });

    it('should pass validation with empty comment', () => {
      const vote = new Vote(1, 1);
      expect(() => vote.assertIsValid()).not.toThrow();
    });

    it('should throw error with comment exceeding maximum length', () => {
      // Create a comment that exceeds 500 characters
      const longComment = stringToBytes('x'.repeat(501));
      const vote = new Vote(1, 1, longComment);
      expect(() => vote.assertIsValid()).toThrow(
        'Comment exceeds maximum length of 500 characters',
      );
    });
  });

  describe('storage operations', () => {
    it('should save vote with comment', () => {
      const comment = stringToBytes('Test comment');
      const vote = new Vote(1, 1, comment);
      const voterAddr = 'voter123';

      vote.save();

      expect(Storage.has(voteKey(1, voterAddr))).toBe(true);
      expect(Storage.has(commentKey(1, voterAddr))).toBe(true);
      expect(Storage.get(commentKey(1, voterAddr))).toStrictEqual(comment);
    });

    it('should save vote without comment', () => {
      const vote = new Vote(1, 1);
      const voterAddr = 'voter123';

      vote.save();

      expect(Storage.has(voteKey(1, voterAddr))).toBe(true);
      expect(Storage.has(commentKey(1, voterAddr))).toBe(false);
    });

    it('should throw error when saving duplicate vote', () => {
      const vote = new Vote(1, 1);

      vote.save();
      expect(() => vote.save()).toThrow(
        'Voter has already cast a vote for this proposal',
      );
    });
  });
});
