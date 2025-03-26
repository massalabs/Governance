import { Vote } from '../contracts/serializable/vote';
import { Storage } from '@massalabs/massa-as-sdk';

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
    });

    it('should create a vote with provided values', () => {
      const vote = new Vote(1, 1);

      expect(vote.proposalId).toBe(1);
      expect(vote.value).toBe(1);
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const originalVote = new Vote(1, 1);

      const serialized = originalVote.serialize();
      const deserializedVote = new Vote();
      deserializedVote.deserialize(serialized, 0);

      expect(deserializedVote.proposalId).toBe(originalVote.proposalId);
      expect(deserializedVote.value).toBe(originalVote.value);
    });
  });

  describe('storage operations', () => {
    it('should throw error when saving duplicate vote', () => {
      const vote = new Vote(1, 1);

      vote.save();
      expect(() => vote.save()).toThrow(
        'Voter has already cast a vote for this proposal',
      );
    });
  });
});
