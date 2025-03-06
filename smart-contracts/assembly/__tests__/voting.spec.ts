import {
  Args,
  bytesToString,
  stringToBytes,
  u64ToBytes,
  i32ToBytes,
} from '@massalabs/as-types';
import {
  createSC,
  mockAdminContext,
  mockBalance,
  mockTimestamp,
  mockTransferredCoins,
  resetStorage,
  Storage,
} from '@massalabs/massa-as-sdk';
import { setCallStack } from './helpers';
import {
  ownerAddress,
  setMasOgContract,
  submitUpdateProposal,
  constructor as votingSystemConstructor,
  vote,
  refresh,
  deleteProposal,
} from '../contracts/voting-system';
import {
  MASOG_KEY,
  constructor as oracleConstructor,
} from '../contracts/rolls-oracle';
import { constructor as masOgConstructor } from '../contracts/masOg';
import {
  proposalKey,
  UPDATE_PROPOSAL_COUNTER_TAG,
  voting as VOTING_STATUS,
  voteKey,
  commentKey,
  accepted,
  discussion,
  rejected,
  statusKey,
  voting,
} from '../contracts/voting-internals/keys';
import { Proposal } from '../contracts/serializable/proposal';
import { Vote } from '../contracts/serializable/vote';
import {
  generateProposal,
  mockMasogBalance,
  generateVote,
  mockMasogTotalSupply,
} from './utils';

const votingOwner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const masOgOwner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const oracleOwner = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm51';
const nonOwner = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm52';

let votingContractAddress = '';
let masOgAddress = '';
let oracleAddress = '';

const MIN_PROPOSAL_MAS_AMOUNT = u64(1000_000_000_000); // Native MAS coin required
const MIN_PROPOSAL_MASOG_AMOUNT = u64(1000_000_000_000); // MASOG token required
const MIN_VOTE_MASOG_AMOUNT = u64(1_000);
const DISCUSSION_PERIOD = u64(3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
const VOTING_PERIOD = u64(4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds

beforeAll(() => {
  setupContracts();
});

describe('Initialization', () => {
  beforeEach(() => {
    setCallStack(votingOwner, votingContractAddress);
  });

  test('Constructor initializes owner and counter correctly', () => {
    const ownerBytes = ownerAddress([]);
    const owner = bytesToString(ownerBytes);
    const counter = Storage.get(UPDATE_PROPOSAL_COUNTER_TAG);

    expect(owner).toBe(votingOwner);
    expect(counter).toStrictEqual(u64ToBytes(0));
  });

  test('Set MasOg contract', () => {
    const contract = Storage.get(MASOG_KEY);
    expect(contract).toStrictEqual(masOgAddress);
  });

  throws('SetMasOgAddress fails when called by non-owner', () => {
    setCallStack(nonOwner, votingContractAddress);
    setMasOgContract(new Args().add<string>(masOgAddress).serialize());
  });
});

describe('SubmitUpdateProposal', () => {
  beforeEach(() => {
    setCallStack(votingOwner, votingContractAddress);
  });

  test('submitUpdateProposal success', () => {
    const title = 'Proposal Title';
    const forumPostLink = 'Proposal Content';
    const summary = 'Proposal Summary';
    const parameterChange = 'Parameter Change';

    mockMasogBalance(MIN_PROPOSAL_MASOG_AMOUNT);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(MIN_PROPOSAL_MAS_AMOUNT);

    let counter = Storage.get(UPDATE_PROPOSAL_COUNTER_TAG);
    expect(counter).toStrictEqual(u64ToBytes(0));

    const proposal = generateProposal(
      title,
      forumPostLink,
      summary,
      parameterChange,
    );

    const args = new Args().add<Proposal>(proposal).serialize();
    submitUpdateProposal(args);

    const proposalBytes = Storage.get(proposalKey(0));
    const proposalStored = new Proposal();
    proposalStored.deserialize(proposalBytes, 0);

    expect(bytesToString(proposalStored.owner)).toBe(votingOwner);
    expect(bytesToString(proposalStored.title)).toBe(title);
    expect(bytesToString(proposalStored.forumPostLink)).toBe(forumPostLink);
    expect(proposalStored.status).toStrictEqual(discussion);
    expect(proposalStored.creationTimestamp).toBeGreaterThan(0);

    counter = Storage.get(UPDATE_PROPOSAL_COUNTER_TAG);
    expect(counter).toStrictEqual(u64ToBytes(1));

    const isStatusKey = Storage.has(statusKey(discussion, 0));
    expect(isStatusKey).toBe(true);
  });

  throws('If MASOG balance lower than 1000', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'Proposal Content',
      'Proposal Summary',
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();

    mockMasogBalance(1);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(MIN_PROPOSAL_MAS_AMOUNT);
    submitUpdateProposal(args);
  });

  throws('If MAS sent is lower than 1000 MAS', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'Proposal Content',
      'Proposal Summary',
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();

    mockMasogBalance(MIN_PROPOSAL_MASOG_AMOUNT);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(1);
    submitUpdateProposal(args);
  });

  throws('If invalid proposal title', () => {
    const proposal = generateProposal(
      '',
      'Proposal Content',
      'Proposal Summary',
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();

    mockMasogBalance(MIN_PROPOSAL_MASOG_AMOUNT);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(MIN_PROPOSAL_MAS_AMOUNT);
    submitUpdateProposal(args);
  });

  throws('If invalid proposal content', () => {
    const proposal = generateProposal(
      'Proposal Title',
      '',
      'Proposal Summary',
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();

    mockMasogBalance(MIN_PROPOSAL_MASOG_AMOUNT);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(MIN_PROPOSAL_MAS_AMOUNT);
    submitUpdateProposal(args);
  });

  throws('If invalid proposal summary', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'Proposal Content',
      '',
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();

    mockMasogBalance(MIN_PROPOSAL_MASOG_AMOUNT);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(MIN_PROPOSAL_MAS_AMOUNT);
    submitUpdateProposal(args);
  });

  throws('If invalid parameter change', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'Proposal Content',
      'Proposal Summary',
      '',
    );
    const args = new Args().add<Proposal>(proposal).serialize();

    mockMasogBalance(MIN_PROPOSAL_MASOG_AMOUNT);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(MIN_PROPOSAL_MAS_AMOUNT);
    submitUpdateProposal(args);
  });
});

describe('Vote', () => {
  beforeEach(() => {
    resetStorage();
    setupContracts();
    setCallStack(votingOwner, votingContractAddress);
    setupProposal(1, VOTING_STATUS, 1234567890); // Setup a proposal in VOTING status
  });

  test('Vote successfully records a positive vote', () => {
    const voterMASOGBalance = MIN_VOTE_MASOG_AMOUNT * 2; // 2 MASOG
    mockMasogBalance(voterMASOGBalance);
    const voteObj = generateVote(1, 1, 'I support this proposal');
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
    // Check vote is recorded
    const voteKeyBytes = voteKey(1, votingOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(1));
    // Check comment is recorded
    const commentKeyBytes = commentKey(1, votingOwner);
    expect(bytesToString(Storage.get(commentKeyBytes))).toBe(
      'I support this proposal',
    );
    // Check proposal updated
    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.positiveVoteVolume).toBe(voterMASOGBalance);
    expect(proposal.negativeVoteVolume).toBe(0);
    expect(proposal.blankVoteVolume).toBe(0);
  });

  test('Vote successfully records a blank vote', () => {
    const voterMASOGBalance = MIN_VOTE_MASOG_AMOUNT * 3; // 3 MASOG
    mockMasogBalance(voterMASOGBalance);

    const voteObj = generateVote(1, 0, 'Neutral opinion');
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);

    const voteKeyBytes = voteKey(1, votingOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(0));

    const commentKeyBytes = commentKey(1, votingOwner);
    expect(bytesToString(Storage.get(commentKeyBytes))).toBe('Neutral opinion');

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.blankVoteVolume).toBe(voterMASOGBalance);
    expect(proposal.positiveVoteVolume).toBe(0);
    expect(proposal.negativeVoteVolume).toBe(0);
  });

  test('Vote successfully records a negative vote', () => {
    const voterMASOGBalance = MIN_VOTE_MASOG_AMOUNT * 4; // 4 MASOG
    mockMasogBalance(voterMASOGBalance);

    const voteObj = generateVote(1, -1, 'I oppose this');
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);

    const voteKeyBytes = voteKey(1, votingOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(-1));

    const commentKeyBytes = commentKey(1, votingOwner);
    expect(bytesToString(Storage.get(commentKeyBytes))).toBe('I oppose this');

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.negativeVoteVolume).toBe(voterMASOGBalance);
    expect(proposal.positiveVoteVolume).toBe(0);
    expect(proposal.blankVoteVolume).toBe(0);
  });

  throws('Vote fails if proposal is not in VOTING status', () => {
    // Submit a proposal in DISCUSSION status
    const proposal = generateProposal(
      'New Proposal',
      'http://forum.com/new',
      'New Summary',
      'New Change',
    );
    mockMasogBalance(MIN_PROPOSAL_MASOG_AMOUNT);
    mockBalance(votingOwner, MIN_PROPOSAL_MAS_AMOUNT);
    mockTransferredCoins(MIN_PROPOSAL_MAS_AMOUNT);
    submitUpdateProposal(new Args().add<Proposal>(proposal).serialize());
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);

    const voteObj = generateVote(2, 1, 'Cannot vote yet');
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails if proposal does not exist', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    const voteObj = generateVote(999, 1, 'Non-existent proposal');
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails if MASOG balance is less than 1', () => {
    const voteObj = generateVote(1, 1, 'Insufficient balance');
    mockMasogBalance(0);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails if voter has already voted', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    const voteObj = generateVote(1, 1, 'First vote');
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args); // First vote succeeds

    // Try voting again
    const secondVoteObj = generateVote(1, -1, 'Second vote');
    const secondArgs = new Args().add<Vote>(secondVoteObj).serialize();
    vote(secondArgs); // Should fail
  });

  throws('Vote fails with invalid vote value', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    const voteObj = generateVote(1, 2, 'Invalid vote value'); // 2 is not 1, 0, or -1
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });
});

describe('Refresh', () => {
  beforeEach(() => {
    setupContracts();
    setCallStack(votingOwner, votingContractAddress);
  });

  afterEach(() => {
    resetStorage();
  });

  test('Refresh transitions DISCUSSION to VOTING after 3 weeks', () => {
    const baseTime = u64(1000000000);
    setupProposal(1, discussion, baseTime);
    setupProposal(2, discussion, baseTime);
    let isStatusKey = Storage.has(statusKey(discussion, 1));
    expect(isStatusKey).toBe(true);
    // Set timestamp to 3 weeks + 1 millisecond
    mockTimestamp(u64(baseTime + DISCUSSION_PERIOD + 1));
    mockMasogTotalSupply(u64(1000_000_000_000));
    refresh([]);
    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.status).toStrictEqual(VOTING_STATUS);
    isStatusKey = Storage.has(statusKey(voting, 1));
    expect(isStatusKey).toBe(true);
  });

  test('Refresh transitions VOTING to ACCEPTED after 4 weeks with majority', () => {
    const baseTime = u64(1000000000);
    const totalSupply = u64(1000_000_000_000); // 1000 MASOG
    setupProposal(1, VOTING_STATUS, baseTime, totalSupply / 2 + 1); // >50% positive votes
    mockMasogTotalSupply(totalSupply);

    let isStatusKey = Storage.has(statusKey(voting, 1));
    expect(isStatusKey).toBe(true);

    // Set timestamp to 4 weeks + 1 millisecond
    mockTimestamp(baseTime + VOTING_PERIOD + 1);
    refresh([]);

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.status).toStrictEqual(accepted);

    isStatusKey = Storage.has(statusKey(accepted, 1));
    expect(isStatusKey).toBe(true);
  });

  test('Refresh transitions VOTING to REJECTED after 4 weeks without majority', () => {
    const baseTime = u64(1000000000);
    const totalSupply = u64(1000_000_000_000); // 1000 MASOG
    setupProposal(1, VOTING_STATUS, baseTime, totalSupply / 2); // Exactly 50%, not >50%
    mockMasogTotalSupply(totalSupply);

    // Set timestamp to 4 weeks + 1 millisecond
    mockTimestamp(baseTime + VOTING_PERIOD + 1);
    refresh([]);

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.status).toStrictEqual(rejected);
  });

  test('Refresh processes multiple proposals in batch', () => {
    const baseTime = u64(1000000000);
    const totalSupply = u64(1000_000_000_000);

    setupProposal(1, discussion, baseTime);
    setupProposal(2, voting, baseTime - VOTING_PERIOD, totalSupply / 2 + 1);

    mockMasogTotalSupply(totalSupply);
    mockTimestamp(baseTime + DISCUSSION_PERIOD + 1);
    refresh([]);

    const proposal1 = Proposal.getById(1);
    expect(proposal1.status).toStrictEqual(voting);

    const proposal2 = Proposal.getById(2);
    expect(proposal2.status).toStrictEqual(accepted);
  });

  test('Refresh does not change status if time not exceeded', () => {
    const baseTime = u64(1000000000);
    setupProposal(1, discussion, baseTime);

    // Set timestamp to just under 3 weeks
    mockTimestamp(baseTime + DISCUSSION_PERIOD - 1);
    mockMasogTotalSupply(u64(1000_000_000_000));

    refresh([]);

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.status).toStrictEqual(discussion);
  });
});

describe('DeleteProposal', () => {
  beforeEach(() => {
    resetStorage();
    setupContracts();
    setCallStack(votingOwner, votingContractAddress);
    setupProposal(1, voting, 1234567890); // Setup a proposal in DISCUSSION status
  });

  test('Successfully deletes a proposal and all associated data', () => {
    // Add a vote to the proposal
    const voterMASOGBalance = MIN_VOTE_MASOG_AMOUNT * 2;
    mockMasogBalance(voterMASOGBalance);
    const voteObj = generateVote(1, 1, 'Test comment');
    const voteArgs = new Args().add<Vote>(voteObj).serialize();
    vote(voteArgs);

    // Delete the proposal
    const deleteArgs = new Args().add<u64>(1).serialize();
    deleteProposal(deleteArgs);

    // Verify proposal is deleted
    expect(Storage.has(proposalKey(1))).toBe(false);
    expect(Storage.has(statusKey(discussion, 1))).toBe(false);
    expect(Storage.has(voteKey(1, votingOwner))).toBe(false);
    expect(Storage.has(commentKey(1, votingOwner))).toBe(false);
  });

  throws('Fails when trying to delete non-existent proposal', () => {
    const deleteArgs = new Args().add<u64>(888).serialize();
    deleteProposal(deleteArgs);
  });

  throws('Fails when called by non-owner', () => {
    setCallStack(nonOwner, votingContractAddress);
    const deleteArgs = new Args().add<u64>(1).serialize();
    deleteProposal(deleteArgs);
  });
});

function setupContracts(): void {
  mockAdminContext(true);

  // Init oracle contract
  oracleAddress = createSC([]).toString();
  setCallStack(oracleOwner, oracleAddress);
  oracleConstructor([]);

  // Init MASOG contract
  masOgAddress = createSC([]).toString();
  setCallStack(masOgOwner, masOgAddress);
  masOgConstructor(new Args().add(oracleAddress).serialize());

  // Init voting system contract
  votingContractAddress = createSC([]).toString();
  setCallStack(votingOwner, votingContractAddress);
  votingSystemConstructor([]);
  mockBalance(votingContractAddress, MIN_PROPOSAL_MAS_AMOUNT);

  // Set MASOG contract address
  setMasOgContract(new Args().add<string>(masOgAddress).serialize());
  mockAdminContext(false);
}

function setupProposal(
  id: u64,
  status: StaticArray<u8>,
  timestamp: u64,
  positiveVotes: u64 = 0,
  negativeVotes: u64 = 0,
  blankVotes: u64 = 0,
): void {
  const proposal = generateProposal(
    `Proposal ${id}`,
    `http://forum.example.com/${id}`,
    `Summary ${id}`,
    `Change ${id}`,
  );
  proposal.id = id;
  proposal.owner = stringToBytes(votingOwner);
  proposal.creationTimestamp = timestamp;
  proposal.positiveVoteVolume = positiveVotes;
  proposal.negativeVoteVolume = negativeVotes;
  proposal.blankVoteVolume = blankVotes;
  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(id));
  proposal.setStatus(status).save();
}
