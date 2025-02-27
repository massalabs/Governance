import {
  Address,
  Context,
  Storage,
  generateEvent,
  transferRemaining,
  call,
  setBytecode,
  balance,
  assertIsSmartContract,
  transferCoins,
  Constant,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  bytesToString,
  bytesToU64,
  i32ToBytes,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  _onlyOwner,
  _setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import {
  UPDATE_PROPOSAL_COUNTER_TAG,
  proposalKey,
  discussion,
  voting,
  voteKey,
  commentKey,
  accepted,
  rejected,
} from './voting-internals/keys';
import { MASOG_KEY } from './rolls-oracle';
import { Proposal } from './serializable/proposal';
import { Vote } from './serializable/vote';
const MIN_PROPOSAL_MAS_AMOUNT = u64(1000_000_000_000); // Native MAS coin required
const MIN_PROPOSAL_MASOG_AMOUNT = u64(1000_000_000_000); // MASOG token required
const MIN_VOTE_MASOG_AMOUNT = u64(1_000_000_000); // MASOG decimals
const MAS_DECIMAL = u64(9); // MAS decimals
const MASOG_DECIMAL = u64(9); // MAS decimals
const DISCUSSION_PERIOD = u64(3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
const VOTING_PERIOD = u64(4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds

/**
 * Initializes the smart contract and sets the deployer as the owner.
 */
export function constructor(_: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());
  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(0)); // Initialize proposal counter

  generateEvent('Voting Contract Initialized');
  transferRemaining(Context.transferredCoins());
}

/**
 * Sets the MASOG contract address (owner-only).
 * @param binaryArgs - Serialized MASOG contract address.
 */
export function setMasOgContract(bin: StaticArray<u8>): void {
  _onlyOwner();
  const oracleAddr = new Args(bin)
    .nextString()
    .expect('Masog contract should be provided');

  assertIsSmartContract(oracleAddr);
  Storage.set(MASOG_KEY, oracleAddr);
}

/*
 * Validates that the caller has enough MASOG balance to make a proposal.
 * @param amount - The amount of MASOG required.
 */
function validateMasOgBalance(amount: u64): u64 {
  const masogAddr = Storage.get(MASOG_KEY);
  const balanceArgs = new Args().add(Context.caller().toString());
  const balanceBytes = call(
    new Address(masogAddr),
    'balanceOf',
    balanceArgs,
    0,
  );

  const balance = bytesToU64(balanceBytes);

  assert(
    balance >= amount,
    `Insufficient MASOG balance to make a proposal (need ${
      amount / 10 ** MASOG_DECIMAL
    })`,
  );

  return balance;
}

/**
 * Validates that the caller has enough MAS balance to make a proposal and burns the required amount.
 * @param amount - The amount of MAS required (Nano MAS).
 */
function validateAndBurnMas(amount: u64): void {
  const mas = Context.transferredCoins();
  assert(
    mas >= amount,
    `You need to send ${amount / 10 ** MAS_DECIMAL} MAS to make a proposal`,
  );

  transferCoins(new Address(Constant.BURN_ADDRESS), amount);
}

/**
 * Submits a new update proposal, burning 1000 MASOG.
 * @param binaryArgs - Serialized arguments: forum_post_link, title, summary, parameter_change.
 */
export function submitUpdateProposal(binaryArgs: StaticArray<u8>): void {
  const initialBalance = balance();
  // Check MASOG balance
  validateMasOgBalance(MIN_PROPOSAL_MASOG_AMOUNT);
  // Check MAS balance and burn 1000
  validateAndBurnMas(MIN_PROPOSAL_MAS_AMOUNT);

  const args = new Args(binaryArgs);
  const proposal = args
    .nextSerializable<Proposal>()
    .expect('You need a proposal');

  proposal.validate();

  proposal.creationTimestamp = u64ToBytes(Context.timestamp());
  proposal.owner = stringToBytes(Context.caller().toString());
  proposal.status = stringToBytes(discussion);

  const id = proposal.generateId();

  Storage.set(proposalKey(id), proposal.serialize());
  transferRemaining(initialBalance);
  generateEvent(`Proposal ${id} submitted by ${Context.caller().toString()}`);
}

/**
 * Refreshes proposal statuses in batches.
 * @param binaryArgs - Serialized arguments: startId (u64), maxProposals (u32).
 */
export function refresh(binaryArgs: StaticArray<u8>): void {
  const initialBalance = balance();

  // Parse arguments
  const args = new Args(binaryArgs);
  const startId = args.nextU64().expect('startId is required');
  const maxProposals = args.nextU32().expect('maxProposals is required');

  // Get total number of proposals
  const totalProposals = bytesToU64(Storage.get(UPDATE_PROPOSAL_COUNTER_TAG));
  assert(startId <= totalProposals, 'startId exceeds total proposals');

  // Calculate the range to process
  const endId = min(startId + u64(maxProposals) - 1, totalProposals);
  const currentTimestamp = Context.timestamp();

  for (let id = startId; id <= endId; id++) {
    const key = proposalKey(id);
    if (!Storage.has(key)) continue; // Skip non-existent proposals

    const proposalBytes = Storage.get(key);
    const proposal = new Proposal();
    proposal.deserialize(proposalBytes, 0);

    const creationTime = bytesToU64(proposal.creationTimestamp);
    const age = currentTimestamp - creationTime;
    const status = bytesToString(proposal.status);

    if (status == discussion && age >= DISCUSSION_PERIOD) {
      // Transition DISCUSSION -> VOTING
      proposal.status = stringToBytes(voting);
      Storage.set(key, proposal.serialize());
      generateEvent(`Proposal ${id} status changed to VOTING`);
    } else if (status == voting && age >= VOTING_PERIOD) {
      // Get MASOG total supply
      const masogAddr = Storage.get(MASOG_KEY);
      const totalSupplyBytes = call(
        new Address(masogAddr),
        'totalSupply',
        new Args(),
        0,
      );
      const totalSupply = bytesToU64(totalSupplyBytes);
      const majorityThreshold = totalSupply / 2;

      // Transition VOTING -> PASS or REJECT
      if (proposal.positiveVoteVolume > majorityThreshold) {
        proposal.status = stringToBytes(accepted);
        generateEvent(`Proposal ${id} status changed to ACCEPTED`);
      } else {
        proposal.status = stringToBytes(rejected);
        generateEvent(`Proposal ${id} status changed to REJECTED`);
      }
      Storage.set(key, proposal.serialize());
    }
  }

  transferRemaining(initialBalance);
}

// Utility function to get minimum of two u64 values
function min(a: u64, b: u64): u64 {
  return a < b ? a : b;
}
/**
 * Casts a vote on a proposal.
 * @param binaryArgs - Serialized arguments: proposalId (u64), vote (i32), comment (string).
 */
export function vote(binaryArgs: StaticArray<u8>): void {
  const initialBalance = balance();

  // Parse arguments
  const args = new Args(binaryArgs);
  const vote = args.nextSerializable<Vote>().expect('Vote is required');

  // Get proposal from storage
  const proposalKeyBytes = proposalKey(vote.proposalId);
  assert(Storage.has(proposalKeyBytes), 'Proposal does not exist');

  const proposalBytes = Storage.get(proposalKeyBytes);
  const proposal = new Proposal();
  proposal.deserialize(proposalBytes, 0);

  // Check proposal is in VOTING status
  assert(
    bytesToString(proposal.status) == voting,
    'Proposal must be in VOTING status',
  );

  // Check MASOG balance (minimum 1 MASOG)
  const voterBalance = validateMasOgBalance(MIN_VOTE_MASOG_AMOUNT);

  // Check if voter has already voted
  const voterAddr = Context.caller().toString();
  const voteKeyBytes = voteKey(vote.proposalId, voterAddr);
  assert(
    !Storage.has(voteKeyBytes),
    'Voter has already cast a vote for this proposal',
  );

  // Record the vote
  // TODO: SHould we add voting power at this moment of voting?
  Storage.set(voteKeyBytes, i32ToBytes(vote.value));

  // Record the comment
  const commentKeyBytes = commentKey(vote.proposalId, voterAddr);
  Storage.set(commentKeyBytes, vote.comment);

  // Update vote counters based on vote value
  // Assuming: 1 = positive, 0 = blank, -1 = negative
  if (vote.value == 1) {
    const currentPositive = proposal.positiveVoteVolume;
    proposal.positiveVoteVolume = currentPositive + voterBalance;
  } else if (vote.value == 0) {
    const currentBlank = proposal.blankVoteVolume;
    proposal.blankVoteVolume = currentBlank + voterBalance;
  } else if (vote.value == -1) {
    const currentNegative = proposal.negativeVoteVolume;
    proposal.negativeVoteVolume = currentNegative + voterBalance;
  } else {
    assert(false, 'Invalid vote value. Use 1 (yes), 0 (blank), or -1 (no)');
  }

  // Update proposal in storage
  Storage.set(proposalKeyBytes, proposal.serialize());

  transferRemaining(initialBalance);

  generateEvent(
    `Vote cast on proposal ${vote.proposalId} by ${voterAddr}: ${vote.value}`,
  );
}

/**
 * Upgrade the smart contract bytecode
 */
export function upgradeSC(bytecode: StaticArray<u8>): void {
  _onlyOwner();
  const initialBalance = balance();
  setBytecode(bytecode);
  transferRemaining(initialBalance);
}

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
