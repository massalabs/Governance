import {
  Args,
  bytesToString,
  bytesToU256,
  byteToU8,
} from '@massalabs/as-types';
import {
  changeCallStack,
  resetStorage,
  Storage,
  mockAdminContext,
  createSC,
} from '@massalabs/massa-as-sdk';
import {
  constructor as masOgConstructor,
  refresh,
  balanceOf,
  totalSupply,
  ORACLE_KEY,
  version,
  decimals,
  symbol,
  name,
} from '../contracts/masOg';
import { u256 } from 'as-bignum/assembly';
import {
  feedCycle,
  constructor as oracleConstructor,
} from '../contracts/rolls-oracle';
import { RollEntry } from '../contracts/serializable/roll-entry';
import { getRollsArgs } from './utils';

const masOgOwner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const oracleOwner = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm51';
const nonOwner = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm52';

const staker1 = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm53';
const staker1Rolls = 10;
const staker2 = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm54';
const staker2Rolls = 15;

let oracleAddress = '';
let masOgAddress = '';

const nbCycles = 2;

export function setCallStack(user: string, contract: string): void {
  changeCallStack(user + ' , ' + contract);
}

describe('masOg Token Contract Tests', () => {
  beforeAll(() => {
    resetStorage();
    mockAdminContext(true);

    // init oracle contract
    oracleAddress = createSC([]).toString();
    setCallStack(oracleOwner, oracleAddress);
    oracleConstructor([]);

    // init masog contract
    masOgAddress = createSC([]).toString();
    setCallStack(masOgOwner, masOgAddress);
    masOgConstructor(new Args().add(oracleAddress).serialize());

    mockAdminContext(false);

    // feed oracle
    setCallStack(oracleOwner, oracleAddress);

    const rollData: RollEntry[] = [
      RollEntry.create(staker1, staker1Rolls),
      RollEntry.create(staker2, staker2Rolls),
    ];
    for (let i = 1; i <= nbCycles; i++) {
      feedCycle(getRollsArgs(rollData, i));
    }
  });

  test('Contract initialized', () => {
    setCallStack(nonOwner, masOgAddress);

    expect(Storage.get(ORACLE_KEY)).toBe(oracleAddress);
    expect(bytesToString(version([]))).toBe('0.0.1');
    expect(bytesToString(name([]))).toBe('MASOG');
    expect(bytesToString(symbol([]))).toBe('MASOG');
    expect(bytesToU256(totalSupply([]))).toBe(u256.Zero);
    expect(byteToU8(decimals([]))).toBe(<u8>9);
  });

  test('Refresh', () => {
    setCallStack(nonOwner, masOgAddress);

    refresh(new Args().add(<i32>0).serialize());

    const staker1balance = bytesToU256(
      balanceOf(new Args().add(staker1).serialize()),
    );
    expect(staker1balance).toBe(u256.fromU64(staker1Rolls * nbCycles));

    const staker2balance = bytesToU256(
      balanceOf(new Args().add(staker2).serialize()),
    );
    expect(staker2balance).toBe(u256.fromU64(staker2Rolls * nbCycles));
  });
});
