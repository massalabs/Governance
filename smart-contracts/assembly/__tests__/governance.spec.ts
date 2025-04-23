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
  mockScCall,
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
  constructor as governanceConstructor,
  vote,
  refresh,
  deleteProposal,
} from '../contracts/governance';
import {
  MASOG_KEY,
  constructor as oracleConstructor,
} from '../contracts/rolls-oracle';
import { constructor as masOgConstructor } from '../contracts/masOg';
import {
  proposalKey,
  UPDATE_PROPOSAL_COUNTER_TAG,
  votingStatus,
  voteKey,
  acceptedStatus,
  discussionStatus,
  rejectedStatus,
  statusKey,
} from '../contracts/governance-internals/keys';
import { Proposal } from '../contracts/serializable/proposal';
import { Vote } from '../contracts/serializable/vote';
import {
  generateProposal,
  mockMasogBalance,
  generateVote,
  mockMasogTotalSupply,
  mockCheckLastAutoRefresh,
} from './utils';
import {
  MIN_PROPOSAL_MASOG_AMOUNT,
  MIN_PROPOSAL_MAS_AMOUNT,
  MIN_VOTE_MASOG_AMOUNT,
  DISCUSSION_PERIOD,
  VOTING_PERIOD
} from '../contracts/governance-internals/config';
import { ASC_END_PERIOD } from '../contracts/governance-internals/auto-refresh';
import { u256 } from 'as-bignum/assembly';

const governanceOwner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const masOgOwner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const oracleOwner = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm51';
const nonOwner = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm52';

let governanceContractAddress = '';
let masOgAddress = '';
let oracleAddress = '';



describe('Initialization', () => {
  beforeEach(() => {
    setupContracts();
    setCallStack(governanceOwner, governanceContractAddress);
  });

  test('Constructor initializes owner and counter correctly', () => {
    const ownerBytes = ownerAddress([]);
    const owner = bytesToString(ownerBytes);
    const counter = Storage.get(UPDATE_PROPOSAL_COUNTER_TAG);

    expect(owner).toBe(governanceOwner);
    expect(counter).toStrictEqual(u64ToBytes(0));
  });

  test('Set MasOg contract', () => {
    const contract = Storage.get(MASOG_KEY);
    expect(contract).toStrictEqual(masOgAddress);
  });

  throws('SetMasOgAddress fails when called by non-owner', () => {
    setCallStack(nonOwner, governanceContractAddress);
    setMasOgContract(new Args().add<string>(masOgAddress).serialize());
  });
});

describe('SubmitUpdateProposal', () => {
  beforeEach(() => {
    setupContracts();
    setCallStack(governanceOwner, governanceContractAddress);
  });
  afterEach(() => {
    resetStorage();
  });

  test('submitUpdateProposal success', () => {
    const title = 'Proposal Title';
    const forumPostLink = 'Proposal Content';
    const summary = 'Proposal Summary';
    const parameterChange = 'Parameter Change';
    mockCheckLastAutoRefresh();
    mockProposalBalances();

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

    expect(bytesToString(proposalStored.owner)).toBe(governanceOwner);
    expect(bytesToString(proposalStored.title)).toBe(title);
    expect(bytesToString(proposalStored.forumPostLink)).toBe(forumPostLink);
    expect(proposalStored.status).toStrictEqual(discussionStatus);
    expect(proposalStored.creationTimestamp).toBeGreaterThan(0);

    counter = Storage.get(UPDATE_PROPOSAL_COUNTER_TAG);
    expect(counter).toStrictEqual(u64ToBytes(1));

    const isStatusKey = Storage.has(statusKey(discussionStatus, 0));
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

    mockProposalBalances(u256.Zero);
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

    mockProposalBalances(MIN_PROPOSAL_MASOG_AMOUNT, MIN_PROPOSAL_MAS_AMOUNT, 1);
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

    mockProposalBalances();
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

    mockProposalBalances();
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

    mockProposalBalances();
    submitUpdateProposal(args);
  });

  throws('If invalid parameter change', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'Proposal Content',
      'Proposal Summary',
      // More than 500 characters
      '{"aaaaaa": "bbbbbb"}' + 'a'.repeat(490),
    );
    const args = new Args().add<Proposal>(proposal).serialize();
    mockProposalBalances();
    submitUpdateProposal(args);
  });

  throws('If title length exceeds 100 characters', () => {
    const proposal = generateProposal(
      'a'.repeat(101), // 101 characters
      'Proposal Content',
      'Proposal Summary',
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();
    mockProposalBalances();
    submitUpdateProposal(args);
  });

  throws('If summary length exceeds 500 characters', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'Proposal Content',
      'a'.repeat(501), // 501 characters
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();
    mockProposalBalances();
    submitUpdateProposal(args);
  });

  throws('If forumPostLink length exceeds 200 characters', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'a'.repeat(201), // 201 characters
      'Proposal Summary',
      'Parameter Change',
    );
    const args = new Args().add<Proposal>(proposal).serialize();
    mockProposalBalances();
    submitUpdateProposal(args);
  });

  throws('If parameterChange length exceeds 500 characters', () => {
    const proposal = generateProposal(
      'Proposal Title',
      'Proposal Content',
      'Proposal Summary',
      'a'.repeat(501), // 501 characters
    );
    const args = new Args().add<Proposal>(proposal).serialize();
    mockProposalBalances();
    submitUpdateProposal(args);
  });

  test('Proposal with maximum allowed lengths is accepted', () => {
    const proposal = generateProposal(
      'a'.repeat(100), // 100 characters (max)
      'a'.repeat(200), // 200 characters (max)
      'a'.repeat(500), // 500 characters (max)
      'a'.repeat(500), // 500 characters (max)
    );
    const args = new Args().add<Proposal>(proposal).serialize();
    mockProposalBalances();
    mockCheckLastAutoRefresh();
    submitUpdateProposal(args);

    const proposalBytes = Storage.get(proposalKey(0));
    const proposalStored = new Proposal();
    proposalStored.deserialize(proposalBytes, 0);

    expect(bytesToString(proposalStored.title).length).toBe(100);
    expect(bytesToString(proposalStored.forumPostLink).length).toBe(200);
    expect(bytesToString(proposalStored.summary).length).toBe(500);
    expect(bytesToString(proposalStored.parameterChange).length).toBe(500);
  });
});

describe('Vote', () => {
  const baseTimestamp = u64(1234567890); // Base creation timestamp in milliseconds

  beforeEach(() => {
    resetStorage();
    setupContracts();
    setCallStack(governanceOwner, governanceContractAddress);
    setupProposal(1, votingStatus, baseTimestamp); // Proposal in VOTING status
  });

  test('Vote successfully records a positive vote', () => {
    const voterMASOGBalance = u256.mul(MIN_VOTE_MASOG_AMOUNT, u256.fromU64(2)); // 2 MASOG
    mockMasogBalance(voterMASOGBalance);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1); // 5:00.001 after creation
    const voteObj = generateVote(1, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + VOTING_PERIOD + 1);
    const voteKeyBytes = voteKey(1, governanceOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(1));

    mockMasogTotalSupply(u256.fromU64(1000_000_000_000));

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.positiveVoteVolume).toBe(u256.fromU64(0)); // result is calculated at the end of the voting period
    expect(proposal.negativeVoteVolume).toBe(u256.fromU64(0));
    expect(proposal.blankVoteVolume).toBe(u256.fromU64(0));
  });

  test('Vote successfully records a blank vote', () => {
    const voterMASOGBalance = u256.mul(MIN_VOTE_MASOG_AMOUNT, u256.fromU64(3)); // 3 MASOG
    mockMasogBalance(voterMASOGBalance);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1); // 5:00.001 after creation
    const voteObj = generateVote(1, 0);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);

    const voteKeyBytes = voteKey(1, governanceOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(0));

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.blankVoteVolume).toBe(u256.fromU64(0)); // result is calculated at the end of the voting period
    expect(proposal.positiveVoteVolume).toBe(u256.fromU64(0));
    expect(proposal.negativeVoteVolume).toBe(u256.fromU64(0));
  });

  test('Vote successfully records a negative vote', () => {
    const voterMASOGBalance = u256.mul(MIN_VOTE_MASOG_AMOUNT, u256.fromU64(4)); // 4 MASOG
    mockMasogBalance(voterMASOGBalance);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1); // 5:00.001 after creation
    const voteObj = generateVote(1, -1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);

    const voteKeyBytes = voteKey(1, governanceOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(-1));

    const proposalBytes = Storage.get(proposalKey(1));
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);
    expect(proposal.negativeVoteVolume).toBe(u256.Zero); // Updated in refresh
    expect(proposal.positiveVoteVolume).toBe(u256.Zero);
    expect(proposal.blankVoteVolume).toBe(u256.Zero);
  });

  test('Vote succeeds at exact start of voting period', () => {
    const voterMASOGBalance = u256.mul(MIN_VOTE_MASOG_AMOUNT, u256.fromU64(2));
    mockMasogBalance(voterMASOGBalance);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD); // Exactly 5:00.000
    const voteObj = generateVote(1, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);

    const voteKeyBytes = voteKey(1, governanceOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(1));
  });

  test('Vote succeeds at exact end of voting period', () => {
    const voterMASOGBalance = u256.mul(MIN_VOTE_MASOG_AMOUNT, u256.fromU64(2));
    mockMasogBalance(voterMASOGBalance);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + VOTING_PERIOD); // Exactly 15:00.000
    const voteObj = generateVote(1, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);

    const voteKeyBytes = voteKey(1, governanceOwner);
    expect(Storage.get(voteKeyBytes)).toStrictEqual(i32ToBytes(1));
  });

  throws('Vote fails before voting period starts', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD - 1); // 4:59.999
    const voteObj = generateVote(1, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails after voting period ends', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + VOTING_PERIOD + 1); // 15:00.001
    const voteObj = generateVote(1, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails if proposal is not in VOTING status', () => {
    const proposal = generateProposal(
      'New Proposal',
      'http://forum.com/new',
      'New Summary',
      'New Change',
    );
    mockProposalBalances();
    submitUpdateProposal(new Args().add<Proposal>(proposal).serialize());
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1); // Within voting period, but status is DISCUSSION
    const voteObj = generateVote(2, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails if proposal does not exist', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1);
    const voteObj = generateVote(999, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails if MASOG balance is less than minimum', () => {
    mockMasogBalance(u256.sub(MIN_VOTE_MASOG_AMOUNT, u256.fromU64(1)));
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1);
    const voteObj = generateVote(1, 1);
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });

  throws('Vote fails if voter has already voted', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1);
    const voteObj = generateVote(1, 1);
    vote(new Args().add<Vote>(voteObj).serialize());

    const secondVoteObj = generateVote(1, -1);
    vote(new Args().add<Vote>(secondVoteObj).serialize());
  });

  throws('Vote fails with invalid vote value', () => {
    mockMasogBalance(MIN_VOTE_MASOG_AMOUNT);
    mockTimestamp(baseTimestamp + DISCUSSION_PERIOD + 1);
    const voteObj = generateVote(1, 2); // 2 is not 1, 0, or -1
    const args = new Args().add<Vote>(voteObj).serialize();
    vote(args);
  });
});

describe('Refresh', () => {
  beforeEach(() => {
    setupContracts();
    setCallStack(governanceOwner, governanceContractAddress);
  });

  afterEach(() => {
    resetStorage();
  });

  test('Refresh transitions DISCUSSION to VOTING after discussion period', () => {
    const baseTime = u64(1000000);
    setupProposal(1, discussionStatus, baseTime);
    mockTimestamp(baseTime + DISCUSSION_PERIOD + 1); // 5:00.001
    mockMasogTotalSupply(u256.fromU64(1000_000_000_000));
    refresh([]);

    const proposal = Proposal.getById(1);
    expect(proposal.status).toStrictEqual(votingStatus);
    expect(Storage.has(statusKey(votingStatus, 1))).toBe(true);
  });

  test('Refresh keeps VOTING status at exact end of voting period', () => {
    const baseTime = u64(1000000);
    setupProposal(1, votingStatus, baseTime);
    mockTimestamp(baseTime + DISCUSSION_PERIOD + VOTING_PERIOD); // Exactly 15:00.000
    mockMasogTotalSupply(u256.fromU64(1000_000_000_000));
    refresh([]);

    const proposal = Proposal.getById(1);
    expect(proposal.status).toStrictEqual(votingStatus); // Still votingStatus
  });

  test('Refresh transitions VOTING to ACCEPTED after voting period with majority', () => {
    const baseTime = u64(1000000);
    const totalSupply = u256.fromU64(1000_000_000_000);
    setupProposal(1, votingStatus, baseTime, u256.fromU64(5_00_000_000_001)); // >50%
    mockMasogTotalSupply(totalSupply);
    mockTimestamp(baseTime + DISCUSSION_PERIOD + VOTING_PERIOD + 1); // 15:00.001
    refresh([]);

    const proposal = Proposal.getById(1);
    expect(proposal.status).toStrictEqual(acceptedStatus);
    expect(Storage.has(statusKey(acceptedStatus, 1))).toBe(true);
  });

  test('Refresh transitions VOTING to REJECTED after voting period without majority', () => {
    const baseTime = u64(1000000);
    const totalSupply = u256.fromU64(1000_000_000_000);
    setupProposal(1, votingStatus, baseTime, u256.fromU64(5_00_000_000_000)); // Exactly at threshold
    mockMasogTotalSupply(totalSupply);
    mockTimestamp(baseTime + DISCUSSION_PERIOD + VOTING_PERIOD + 1); // 15:00.001
    refresh([]);

    const proposal = Proposal.getById(1);
    expect(proposal.status).toStrictEqual(rejectedStatus);
  });

  test('Refresh processes multiple proposals in batch', () => {
    const baseTime = u64(1000000);
    const totalSupply = u256.fromU64(1000_000_000_000);
    setupProposal(1, discussionStatus, baseTime);
    setupProposal(2, votingStatus, baseTime - DISCUSSION_PERIOD - VOTING_PERIOD,
      u256.fromU64(5_00_000_000_001)); // Already past voting
    mockMasogTotalSupply(totalSupply);
    mockTimestamp(baseTime + DISCUSSION_PERIOD + 1); // 5:00.001
    refresh([]);

    const proposal1 = Proposal.getById(1);
    expect(proposal1.status).toStrictEqual(votingStatus);

    const proposal2 = Proposal.getById(2);
    expect(proposal2.status).toStrictEqual(acceptedStatus);
  });

  test('Refresh does not change status if time not exceeded', () => {
    const baseTime = u64(1000000);
    setupProposal(1, discussionStatus, baseTime);
    mockTimestamp(baseTime + DISCUSSION_PERIOD - 1); // 4:59.999
    mockMasogTotalSupply(u256.fromU64(1000_000_000_000));
    refresh([]);

    const proposal = Proposal.getById(1);
    expect(proposal.status).toStrictEqual(discussionStatus);
  });
});

describe('DeleteProposal', () => {
  beforeEach(() => {
    resetStorage();
    setupContracts();
    setCallStack(governanceOwner, governanceContractAddress);
    setupProposal(1, votingStatus, 1234567890); // Setup a proposal in DISCUSSION status
  });

  test('Successfully deletes a proposal and all associated data', () => {
    const baseTime = u64(1000000);
    const totalSupply = u256.fromU64(1000_000_000_000);
    // Setup proposal with votes exactly at threshold to ensure it gets rejected
    setupProposal(1, votingStatus, baseTime, u256.fromU64(5_00_000_000_000));
    mockMasogTotalSupply(totalSupply);
    mockTimestamp(baseTime + DISCUSSION_PERIOD + VOTING_PERIOD + 1); // 15:00.001
    refresh([]); // This will transition the proposal to rejected status

    // Verify proposal is in rejected status before deletion
    const proposalBeforeDelete = Proposal.getById(1);
    expect(proposalBeforeDelete.status).toStrictEqual(rejectedStatus);

    // Delete the proposal
    const deleteArgs = new Args().add<u64>(1).serialize();
    deleteProposal(deleteArgs);

    // Verify proposal is deleted
    expect(Storage.has(proposalKey(1))).toBe(false);
    expect(Storage.has(statusKey(rejectedStatus, 1))).toBe(false);
    expect(Storage.has(voteKey(1, governanceOwner))).toBe(false);
  });

  throws('Fails when trying to delete a proposal not Rejected', () => {
    mockTimestamp(1234567890 + DISCUSSION_PERIOD + 1);
    mockScCall([]);
    // Add a vote to the proposal
    const voterMASOGBalance = u256.mul(MIN_VOTE_MASOG_AMOUNT, u256.fromU64(2));
    mockMasogBalance(voterMASOGBalance);
    const voteObj = generateVote(1, 1);
    const voteArgs = new Args().add<Vote>(voteObj).serialize();
    vote(voteArgs);

    // Delete the proposal
    const deleteArgs = new Args().add<u64>(1).serialize();
    deleteProposal(deleteArgs);

    // Verify proposal is deleted
    expect(Storage.has(proposalKey(1))).toBe(false);
    expect(Storage.has(statusKey(discussionStatus, 1))).toBe(false);
    expect(Storage.has(voteKey(1, governanceOwner))).toBe(false);
  });

  throws('Fails when trying to delete non-existent proposal', () => {
    const deleteArgs = new Args().add<u64>(888).serialize();
    deleteProposal(deleteArgs);
  });

  throws('Fails when called by non-owner', () => {
    setCallStack(nonOwner, governanceContractAddress);
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

  // Init governance system contract
  governanceContractAddress = createSC([]).toString();
  setCallStack(governanceOwner, governanceContractAddress);
  governanceConstructor(new Args().add(oracleAddress).serialize());
  mockBalance(governanceContractAddress, MIN_PROPOSAL_MAS_AMOUNT);
  Storage.set(ASC_END_PERIOD, u64ToBytes(1234567890));

  // Set MASOG contract address
  setMasOgContract(new Args().add<string>(masOgAddress).serialize());
  mockAdminContext(false);
}

function setupProposal(
  id: u64,
  status: StaticArray<u8>,
  timestamp: u64,
  positiveVotes: u256 = u256.fromU64(0),
  negativeVotes: u256 = u256.fromU64(0),
  blankVotes: u256 = u256.fromU64(0),
): void {
  const proposal = generateProposal(
    `Proposal ${id}`,
    `http://forum.example.com/${id}`,
    `Summary ${id}`,
    `{}`,
  );
  proposal.id = id;
  proposal.owner = stringToBytes(governanceOwner);
  proposal.creationTimestamp = timestamp;
  proposal.positiveVoteVolume = positiveVotes;
  proposal.negativeVoteVolume = negativeVotes;
  proposal.blankVoteVolume = blankVotes;
  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(id));
  proposal.setStatus(status).save();
}

function mockProposalBalances(
  masogBalance: u256 = MIN_PROPOSAL_MASOG_AMOUNT,
  masBalance: u64 = MIN_PROPOSAL_MAS_AMOUNT,
  transferredCoins: u64 = MIN_PROPOSAL_MAS_AMOUNT,
): void {
  mockMasogBalance(masogBalance);
  mockBalance(governanceOwner, masBalance);
  mockTransferredCoins(transferredCoins);
}
