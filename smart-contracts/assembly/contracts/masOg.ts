import { u256 } from 'as-bignum/assembly';
import { mrc20Constructor } from '@massalabs/sc-standards/assembly/contracts/MRC20';
import { _onlyOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import {
  Args,
  bytesToString,
  bytesToU64,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  Address,
  getKeysOf,
  setBytecode,
  Storage,
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

const LAST_UPDATED_CYCLE = stringToBytes('LAST_UPDATE');
const ORACLE_KEY = 'ORACLE_KEY';

export function constructor(bin: StaticArray<u8>): void {
  mrc20Constructor('MASOG', 'MASOG', 9, u256.Zero);
  const oracleAddr = new Args(bin)
    .nextString()
    .expect('Oracle contract should be provided');
  Storage.set(ORACLE_KEY, oracleAddr);
}

export function upgradeSC(bytecode: StaticArray<u8>): void {
  _onlyOwner();
  setBytecode(bytecode);
}

export function setOracle(bin: StaticArray<u8>): void {
  _onlyOwner();
  const oracleAddr = new Args(bin)
    .nextString()
    .expect('Oracle contract should be provided');
  Storage.set(ORACLE_KEY, oracleAddr);
}

export function refresh(): void {
  const oracleAddrStr = Storage.get(ORACLE_KEY);
  const oracleAddr = new Address(oracleAddrStr);

  assert(
    Storage.hasOf(oracleAddr, ORACLE_LAST_RECORDED_CYCLE),
    'Oracle contract should have LAST_CYCLE_TAG',
  );

  let lastCycle = bytesToU64(
    Storage.getOf(oracleAddr, ORACLE_LAST_RECORDED_CYCLE),
  );
  let startCycle = 0;

  if (Storage.has(LAST_UPDATED_CYCLE)) {
    startCycle = bytesToU64(Storage.get(LAST_UPDATED_CYCLE)) + 1;
  } else {
    // first refresh
    startCycle = lastCycle - 1;
  }

  assert(startCycle <= lastCycle, 'Nothing to update');

  let totalminted = 0;

  for (let cycle = startCycle; cycle <= lastCycle; cycle++) {
    assert(
      Storage.hasOf(oracleAddr, recordedCycleKey(cycle)),
      `Cycle ${cycle} is not registered in oracle contract`,
    );

    const starkersPrefix = rollKeyPrefix(cycle);
    const stakersData = getKeysOf(oracleAddrStr, starkersPrefix);
    for (let i = 0; i < stakersData.length; i++) {
      const stakerAddrBytes = stakersData[i].slice(starkersPrefix.length);
      const rolls = bytesToU64(
        Storage.getOf(oracleAddr, rollKeyBytes(cycle, stakerAddrBytes)),
      );
      const amount = u256.fromU64(rolls);

      // Mint
      _increaseBalance(new Address(bytesToString(stakerAddrBytes)), amount);
      totalminted += rolls;
    }
  }

  _increaseTotalSupply(u256.fromU64(totalminted));

  Storage.set(LAST_UPDATED_CYCLE, u64ToBytes(lastCycle));
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
