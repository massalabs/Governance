import {
  Args,
  bytesToU256,
  i32ToBytes,
  stringToBytes,
  u64ToBytes,
  u256ToBytes,
} from '@massalabs/as-types';
import {
  createSC,
  getKeysPage,
  MAX_DATASTORE_KEYS_PAGE,
  mockAdminContext,
  mockBalance,
  mockScCall,
  mockTimestamp,
  mockTransferredCoins,
  resetStorage,
  Storage,
} from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly';
import {
  constructor as oracleConstructor,
  deleteCycle,
  feedCycle,
  setMasOgAddress,
} from '../contracts/rolls-oracle';
import { _countRollEntries } from '../contracts/oracle-internals';
import {
  deletingCycleKey,
  rollKeyPrefix,
} from '../contracts/oracle-internals/keys';
import {
  balanceOf,
  constructor as masOgConstructor,
  refresh as masOgRefresh,
  totalSupply,
} from '../contracts/masOg';
import {
  constructor as governanceConstructor,
  deleteProposal,
  refresh as governanceRefresh,
  setMasOgContract,
} from '../contracts/governance';
import {
  discussionStatus,
  proposalKey,
  rejectedStatus,
  statusKeyPrefix,
  UPDATE_PROPOSAL_COUNTER_TAG,
  voteKey,
  votingStatus,
} from '../contracts/governance-internals/keys';
import {
  DISCUSSION_PERIOD,
  MIN_PROPOSAL_MAS_AMOUNT,
  VOTING_PERIOD,
} from '../contracts/governance-internals/config';
import { ASC_END_PERIOD } from '../contracts/governance-internals/auto-refresh';
import { Proposal } from '../contracts/serializable/proposal';
import { RollEntry } from '../contracts/serializable/roll-entry';
import { generateProposal, getRollsArgs } from './utils';
import { setCallStack } from './helpers';

const owner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const oracleOwner = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm51';

// More entries than one page of datastore keys.
const MANY = MAX_DATASTORE_KEYS_PAGE + 100;

function addressOf(i: i32): string {
  return 'AU1staker' + i.toString().padStart(6, '0');
}

function rollEntries(n: i32, rolls: u64): RollEntry[] {
  const entries: RollEntry[] = [];
  for (let i = 0; i < n; i++) {
    entries.push(RollEntry.create(addressOf(i), rolls));
  }
  return entries;
}

function countKeys(prefix: StaticArray<u8>): i32 {
  let count = 0;
  let keys = getKeysPage(prefix);
  while (keys.length > 0) {
    count += keys.length;
    keys = getKeysPage(prefix, keys[keys.length - 1]);
  }
  return count;
}

let oracleAddress = '';

describe('Oracle past one page of stakers', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    oracleAddress = createSC([]).toString();
    setCallStack(oracleOwner, oracleAddress);
    oracleConstructor([]);
    mockAdminContext(false);
    feedCycle(getRollsArgs(rollEntries(2 * MANY, 10), 1, true));
  });

  test('counts the stakers of a cycle', () => {
    expect(_countRollEntries(1)).toBe(2 * MANY);
  });

  test('feeding the last batch with MasOg set counts every staker', () => {
    mockAdminContext(true);
    const masOgAddress = createSC([]).toString();
    mockAdminContext(false);
    setMasOgAddress(new Args().add(masOgAddress).serialize());
    // The MasOg refresh call is paid per staker: send exactly what MANY stakers need, so a wrong count
    // spends more than sent.
    const refreshCoins = u64(MANY) * 9_600_000 + 1_000_000_000;
    mockBalance(oracleAddress, 0);
    mockBalance(oracleOwner, refreshCoins);
    mockTransferredCoins(refreshCoins);
    mockScCall([]);

    feedCycle(getRollsArgs(rollEntries(MANY, 10), 2, true));
    mockTransferredCoins(0);

    expect(_countRollEntries(2)).toBe(MANY);
  });

  test('deletes a cycle in batches larger than a page', () => {
    deleteCycle(
      new Args()
        .add<u64>(1)
        .add<u32>(u32(MANY + 200))
        .serialize(),
    );
    expect(countKeys(rollKeyPrefix(1))).toBe(2 * MANY - (MANY + 200));
    expect(Storage.has(deletingCycleKey(1))).toBe(true);

    // Exactly the remaining keys: the last page is full, so emptiness is checked with one more read.
    deleteCycle(
      new Args()
        .add<u64>(1)
        .add<u32>(u32(2 * MANY - (MANY + 200)))
        .serialize(),
    );
    expect(countKeys(rollKeyPrefix(1))).toBe(0);
    expect(Storage.has(deletingCycleKey(1))).toBe(false);
  });

  test('deletes a cycle when the batch is larger than what is left', () => {
    deleteCycle(
      new Args()
        .add<u64>(1)
        .add<u32>(u32(10 * MANY))
        .serialize(),
    );
    expect(countKeys(rollKeyPrefix(1))).toBe(0);
    expect(Storage.has(deletingCycleKey(1))).toBe(false);
  });
});

describe('MasOg refresh past one page of stakers', () => {
  test('mints for every staker of every cycle', () => {
    resetStorage();
    mockAdminContext(true);
    const oracleAddress = createSC([]).toString();
    setCallStack(oracleOwner, oracleAddress);
    oracleConstructor([]);
    const masOgAddress = createSC([]).toString();
    setCallStack(owner, masOgAddress);
    masOgConstructor(new Args().add(oracleAddress).serialize());
    mockAdminContext(false);

    setCallStack(oracleOwner, oracleAddress);
    feedCycle(getRollsArgs(rollEntries(MANY, 3), 1, true));
    feedCycle(getRollsArgs(rollEntries(MANY, 3), 2, true));

    setCallStack(owner, masOgAddress);
    masOgRefresh(new Args().add(<i32>0).serialize());

    expect(bytesToU256(totalSupply([]))).toBe(u256.fromU64(u64(MANY) * 3 * 2));
    for (let i = 0; i < MANY; i += MANY - 1) {
      expect(
        bytesToU256(balanceOf(new Args().add(addressOf(i)).serialize())),
      ).toBe(u256.fromU64(6));
    }
  });
});

const baseTime = u64(1000000);

function setupGovernance(): void {
  resetStorage();
  mockAdminContext(true);
  const oracleAddress = createSC([]).toString();
  setCallStack(oracleOwner, oracleAddress);
  oracleConstructor([]);
  const masOgAddress = createSC([]).toString();
  setCallStack(owner, masOgAddress);
  masOgConstructor(new Args().add(oracleAddress).serialize());
  const governanceAddress = createSC([]).toString();
  setCallStack(owner, governanceAddress);
  governanceConstructor(new Args().add(oracleAddress).serialize());
  mockBalance(governanceAddress, MIN_PROPOSAL_MAS_AMOUNT);
  Storage.set(ASC_END_PERIOD, u64ToBytes(1234567890));
  setMasOgContract(new Args().add<string>(masOgAddress).serialize());
  mockAdminContext(false);
}

function setupProposal(id: u64, status: StaticArray<u8>): void {
  const proposal = generateProposal(
    `Proposal ${id}`,
    `http://forum.example.com/${id}`,
    `Summary ${id}`,
    `{}`,
  );
  proposal.id = id;
  proposal.owner = stringToBytes(owner);
  proposal.creationTimestamp = baseTime;
  proposal.positiveVoteVolume = u256.Zero;
  proposal.negativeVoteVolume = u256.Zero;
  proposal.blankVoteVolume = u256.Zero;
  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(id));
  proposal.setStatus(status).save();
}

// 400 votes for, 200 against, each voter holding 1 MASOG.
const nbFor = 400;
const nbAgainst = MANY - nbFor;

function castVotes(id: u64): void {
  for (let i = 0; i < MANY; i++) {
    Storage.set(voteKey(id, addressOf(i)), i32ToBytes(i < nbFor ? 1 : -1));
  }
}

function closeVoting(): void {
  // One balance read per vote, then the total supply.
  for (let i = 0; i < MANY; i++) {
    mockScCall(u256ToBytes(u256.fromU64(1)));
  }
  mockScCall(u256ToBytes(u256.fromU64(1000_000_000_000)));
  mockTimestamp(baseTime + DISCUSSION_PERIOD + VOTING_PERIOD + 1);
  governanceRefresh([]);
}

describe('Governance past one page of keys', () => {
  beforeEach(() => {
    setupGovernance();
  });

  test('counts every vote at the end of the voting period', () => {
    setupProposal(1, votingStatus);
    castVotes(1);

    closeVoting();

    const proposal = Proposal.getById(1);
    expect(proposal.positiveVoteVolume).toBe(u256.fromU64(nbFor));
    expect(proposal.negativeVoteVolume).toBe(u256.fromU64(nbAgainst));
    expect(proposal.status).toStrictEqual(rejectedStatus);
  });

  test('deletes a proposal with more votes than a page', () => {
    setupProposal(1, votingStatus);
    castVotes(1);
    closeVoting();

    deleteProposal(new Args().add<u64>(1).serialize());

    expect(Storage.has(proposalKey(1))).toBe(false);
    expect(countKeys(voteKey(1, ''))).toBe(0);
  });

  test('refreshes more proposals than a page', () => {
    for (let id: u64 = 1; id <= u64(MANY); id++) {
      setupProposal(id, discussionStatus);
    }
    mockTimestamp(baseTime + DISCUSSION_PERIOD + 1);

    governanceRefresh([]);

    expect(countKeys(statusKeyPrefix(discussionStatus))).toBe(0);
    expect(countKeys(statusKeyPrefix(votingStatus))).toBe(MANY);
  });
});
