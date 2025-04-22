import { u256 } from 'as-bignum/assembly';
import { mrc20Constructor } from '@massalabs/sc-standards/assembly/contracts/MRC20';
import { _onlyOwner, OWNER_KEY } from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import {
  Args,
  bytesToString,
  bytesToU64,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  Address,
  assertIsSmartContract,
  balance,
  Context,
  generateEvent,
  getKeysOf,
  setBytecode,
  Storage,
  transferCoins,
  transferRemaining,
} from '@massalabs/massa-as-sdk';
import {
  ORACLE_LAST_RECORDED_CYCLE,
  recordedCycleKey,
  rollKeyBytes,
  rollKeyPrefix,
} from './oracle-internals/keys';
import {
  _increaseBalance,
  _increaseTotalSupply,
} from '@massalabs/sc-standards/assembly/contracts/MRC20/mintable/mint-internal';
import { _balance, _setBalance } from '@massalabs/sc-standards/assembly/contracts/MRC20/MRC20-internals';

const LAST_UPDATED_CYCLE = stringToBytes('LAST_UPDATE');
export const ORACLE_KEY = 'ORACLE_KEY';

export function constructor(bin: StaticArray<u8>): void {
  mrc20Constructor('MASOG', 'MASOG', 0, u256.Zero);

  const oracleAddr = new Args(bin)
    .nextString()
    .expect('Oracle contract should be provided');

  assertIsSmartContract(oracleAddr);
  Storage.set(ORACLE_KEY, oracleAddr);
  Storage.set(LAST_UPDATED_CYCLE, u64ToBytes(0));

}

export function upgradeSC(bytecode: StaticArray<u8>): void {
  _onlyOwner();
  const initialBalance = balance();
  setBytecode(bytecode);
  transferRemaining(initialBalance);
}

export function setOracle(bin: StaticArray<u8>): void {
  _onlyOwner();
  const oracleAddr = new Args(bin)
    .nextString()
    .expect('Oracle contract should be provided');
  Storage.set(ORACLE_KEY, oracleAddr);
}

export function refresh(bin: StaticArray<u8>): void {
  const maxCycles = new Args(bin)
    .nextI32()
    .expect('maxCycles should be provided. use O to refresh all cycles');

  const oracleAddrStr = Storage.get(ORACLE_KEY);
  const oracleAddr = new Address(oracleAddrStr);

  assert(
    Storage.hasOf(oracleAddr, ORACLE_LAST_RECORDED_CYCLE),
    'Oracle contract should have ORACLE_LAST_RECORDED_CYCLE key',
  );

  const initialBalance = balance();

  let lastCycle = bytesToU64(
    Storage.getOf(oracleAddr, ORACLE_LAST_RECORDED_CYCLE),
  );
  let startCycle: u64 = 0;

  if (Storage.has(LAST_UPDATED_CYCLE)) {
    startCycle = bytesToU64(Storage.get(LAST_UPDATED_CYCLE)) + 1;
    if (startCycle > lastCycle) {
      return;
    }
  } else {
    // first refresh
    assert(lastCycle, 'Not enough recorded cycles');
    startCycle = lastCycle - 1;
  }

  assert(startCycle <= lastCycle, 'Nothing to update');

  let totalMinted: u64 = 0;

  for (let cycle = startCycle; cycle <= lastCycle; cycle++) {
    if (maxCycles && cycle >= startCycle + maxCycles) {
      break;
    }

    if (!Storage.hasOf(oracleAddr, recordedCycleKey(cycle))) {
      // generateEvent(`Warning: cycle ${cycle.toString()} is not registered`);
      continue;
    }

    const starkersPrefix = rollKeyPrefix(cycle);
    const stakersData = getKeysOf(oracleAddrStr, starkersPrefix);
    for (let i = 0; i < stakersData.length; i++) {
      const stakerAddrBytes = StaticArray.fromArray(
        stakersData[i].slice(starkersPrefix.length),
      );
      const rolls = bytesToU64(
        Storage.getOf(oracleAddr, rollKeyBytes(cycle, stakerAddrBytes)),
      );

      // Mint
      _increaseBalance(
        new Address(bytesToString(stakerAddrBytes)),
        u256.fromU64(rolls),
      );
      totalMinted += rolls;
    }
  }

  _increaseTotalSupply(u256.fromU64(totalMinted));

  Storage.set(LAST_UPDATED_CYCLE, u64ToBytes(lastCycle));

  const owner = Storage.get(OWNER_KEY);
  transferRemaining(initialBalance, 0, new Address(owner)); // Not working on mainnet between 2 sc
}

/**
 * Receives coins and generates an event
 */
export function receiveCoins(): void {
  generateEvent('CoinsReceived: ' + Context.transferredCoins().toString());
}

/**
 * Allows the owner to withdraw funds from the contract balance.
 * Only the contract owner can call this function.
 * @param binaryArgs - Serialized amount to withdraw.
 * @throws If the caller is not the owner, the amount is invalid, or the contract has insufficient balance.
 */
export function withdrawCoins(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();

  const args = new Args(binaryArgs);
  const amount = args.next<u64>().expect('Invalid amount');
  assert(amount > 0, 'Invalid amount');
  assert(balance() >= amount, 'Contract has insufficient balance');

  transferCoins(Context.caller(), amount);
}

export {
  version,
  name,
  symbol,
  totalSupply,
  decimals,
  balanceOf,
} from '@massalabs/sc-standards/assembly/contracts/MRC20';
export { burn } from '@massalabs/sc-standards/assembly/contracts/MRC20/burnable';
export {
  setOwner,
  isOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
