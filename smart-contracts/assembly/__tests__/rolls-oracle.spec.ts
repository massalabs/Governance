import {
  Args,
  bytesToString,
  bytesToU64,
} from '@massalabs/as-types';
import {
  changeCallStack,
  getKeys,
  resetStorage,
  setDeployContext,
  Storage,
} from '@massalabs/massa-as-sdk';
import {
  constructor,
  feedCycle,
  ownerAddress,
  deleteCycle,
} from '../contracts/rolls-oracle';
import { RollEntry } from '../contracts/serializable/roll-entry';
import {
  deletingCycleKey,
  ORACLE_LAST_RECORDED_CYCLE,
  recordedCycleKey,
  rollKeyBytes,
  rollKeyPrefix,
} from '../contracts/oracle-internals/keys';
import { getRollsArgs } from './utils';

export const contractAddress =
  'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

export function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddress);
}
const owner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const nonOwner = 'AU1NonOwnerExampleAddress';
const cycles = [0, 1, 2, 3, 4, 5, 6, 7, 8];

describe('Oracle Contract Tests', () => {
  beforeEach(() => {
    resetStorage();
    switchUser(owner);
    setDeployContext(owner);
    constructor([]);
  });

  describe('Initialization', () => {
    test('Contract initialized successfully', () => {
      const ownerBinary = ownerAddress(new Args().serialize());
      const owner = bytesToString(ownerBinary);
      expect(Storage.get('OWNER')).toBe(owner);
    });
  });

  describe('Feed Cycle Data', () => {
    // TODO: Remove if solution of using onchain data accepted
    // Not needed with current implementation
    throws('Feed cycle fails if new cycle lower than last cycle', () => {
      const rollData: RollEntry[] = [
        RollEntry.create('address1', 10),
        RollEntry.create('address2', 15),
      ];

      feedCycle(getRollsArgs(rollData, cycles[4]));

      feedCycle(getRollsArgs(rollData, cycles[3]));
    });

    test('Feed cycle data successfully', () => {
      const rollData: RollEntry[] = [
        RollEntry.create('address1', 10),
        RollEntry.create('address2', 15),
      ];

      feedCycle(getRollsArgs(rollData, cycles[1]));

      const lastCycle = bytesToU64(Storage.get(ORACLE_LAST_RECORDED_CYCLE));
      expect(lastCycle).toBe(cycles[1]);

      const cycle = getKeys(recordedCycleKey(cycles[1]));
      expect(cycle.length).toBe(1);

      for (let i = 0; i < rollData.length; i++) {
        const valueBinary = Storage.get(
          rollKeyBytes(cycles[1], rollData[i].address),
        );

        expect(valueBinary).toStrictEqual(rollData[i].rolls);
      }
    });

    test('Update last cycle successfully', () => {
      const rollData: RollEntry[] = [
        RollEntry.create('address1', 10),
        RollEntry.create('address2', 15),
        RollEntry.create('address3', 20),
        RollEntry.create('address4', 25),
      ];

      feedCycle(getRollsArgs(rollData, cycles[1], false));
      let lastCycle = bytesToU64(Storage.get(ORACLE_LAST_RECORDED_CYCLE));
      expect(lastCycle).toBe(cycles[0]);

      feedCycle(getRollsArgs(rollData, cycles[1]));

      lastCycle = bytesToU64(Storage.get(ORACLE_LAST_RECORDED_CYCLE));
      expect(lastCycle).toBe(cycles[1]);

      feedCycle(getRollsArgs(rollData, cycles[2], true));

      const lastCycle2 = bytesToU64(Storage.get(ORACLE_LAST_RECORDED_CYCLE));
      expect(lastCycle2).toBe(cycles[2]);
    });

    throws('Feed cycle fails if caller is not the owner', () => {
      switchUser(nonOwner);

      const rollData: RollEntry[] = [
        RollEntry.create('address1', 10),
        RollEntry.create('address2', 15),
      ];

      feedCycle(getRollsArgs(rollData, cycles[1], true));
    });

    throws('Feed cycle fails if cycle already exists', () => {
      const rollData: RollEntry[] = [
        RollEntry.create('address1', 10),
        RollEntry.create('address2', 15),
      ];

      feedCycle(getRollsArgs(rollData, cycles[1], true));

      feedCycle(getRollsArgs(rollData, cycles[1], true));
    });
  });

  describe('Delete Cycle Data', () => {
    test('Delete cycle data successfully', () => {
      const rollData: RollEntry[] = [
        RollEntry.create('address1', 10),
        RollEntry.create('address2', 15),
        RollEntry.create('address3', 15),
        RollEntry.create('address4', 15),
        RollEntry.create('address5', 15),
        RollEntry.create('address6', 15),
        RollEntry.create('address7', 15),
        RollEntry.create('address8', 15),
      ];

      feedCycle(getRollsArgs(rollData, cycles[1], true));
      const lastCycle = bytesToU64(Storage.get(ORACLE_LAST_RECORDED_CYCLE));
      expect(lastCycle).toBe(cycles[1]);

      let rollKeys = getKeys(rollKeyPrefix(cycles[1]));
      for (let i = 0; i < rollKeys.length; i++) {
        expect(Storage.has(rollKeys[i])).toBeTruthy();
        const value = Storage.get(rollKeys[i]);
        expect(value).toStrictEqual(rollData[i].rolls);
      }

      let deleteArgs = new Args().add<u64>(cycles[1]).add<u64>(4);
      deleteCycle(deleteArgs.serialize());

      rollKeys = getKeys(rollKeyPrefix(cycles[1]));
      expect(rollKeys.length).toBe(4);
      expect(Storage.has(deletingCycleKey(cycles[1]))).toBeTruthy();

      deleteArgs = new Args().add<u64>(cycles[1]).add<u64>(4);
      deleteCycle(deleteArgs.serialize());
      expect(Storage.has(deletingCycleKey(cycles[1]))).toBeFalsy();

      rollKeys = getKeys(rollKeyPrefix(cycles[1]));
      expect(rollKeys.length).toBe(0);
    });

    throws('Delete cycle fails if caller is not the owner', () => {
      switchUser(nonOwner);

      const deleteArgs = new Args().add<u64>(cycles[1]).add<u64>(2);
      deleteCycle(deleteArgs.serialize());
    });

    throws('Delete cycle fails if cycle does not exist', () => {
      const deleteArgs = new Args().add<u64>(cycles[1]).add<u64>(2);
      deleteCycle(deleteArgs.serialize());
    });
  });

  describe('Get Number of Rolls', () => {
    test('Get number of rolls successfully', () => {
      const rollData: RollEntry[] = [
        RollEntry.create('address1', 10),
        RollEntry.create('address2', 20),
        RollEntry.create('address3', 30),
        RollEntry.create('address4', 40),
      ];

      feedCycle(getRollsArgs(rollData, cycles[1], true));

      for (let i = 0; i < rollData.length; i++) {
        const rolls = Storage.get(rollKeyBytes(cycles[1], rollData[i].address));
        expect(rolls).toStrictEqual(rollData[i].rolls);
      }
    });
  });
});
