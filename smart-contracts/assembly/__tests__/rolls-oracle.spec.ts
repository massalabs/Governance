import { Args, bytesToString, bytesToU64 } from '@massalabs/as-types';
import {
  changeCallStack,
  getKeys,
  resetStorage,
  setDeployContext,
  Storage,
  mockCurrentSlot,
} from '@massalabs/massa-as-sdk';
import {
  constructor,
  feedCycle,
  ownerAddress,
  deleteCycle,
} from '../contracts/rolls-oracle';
import { RollEntry } from '../contracts/serializable/roll-entry';
import {
  LAST_CYCLE_TAG,
  recordedCycleKey,
  rollKey,
  rollKeyPrefix,
} from '../contracts/oracle-internals/keys';

export const contractAddress =
  'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

export function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddress);
}
const owner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const nonOwner = 'AU1NonOwnerExampleAddress';
const cycles = [0, 1, 2, 3, 4];
const NB_PERIODS_IN_CYCLE = 128;

function getRollsArgs(
  rollData: RollEntry[],
  isLastBatch: boolean,
): StaticArray<u8> {
  return new Args()
    .addSerializableObjectArray<RollEntry>(rollData)
    .add(isLastBatch)
    .serialize();
}

function periodFromCycle(cycle: u64): u64 {
  return cycle * NB_PERIODS_IN_CYCLE;
}

describe('Oracle Contract Tests', () => {
  beforeEach(() => {
    resetStorage();
    setDeployContext(owner);
    constructor(new Args().serialize());
  });

  describe('Initialization', () => {
    test('Contract initialized successfully', () => {
      const ownerBinary = ownerAddress(new Args().serialize());
      const owner = bytesToString(ownerBinary);
      expect(Storage.get('OWNER')).toBe(owner);
    });
  });

  describe('Feed Cycle Data', () => {
    // TODO: Remove if solution accepted
    // Not needed with current implementation
    // throws('Feed cycle fails if new cycle lower than last cycle', () => {
    //   const rollData: RollEntry[] = [
    //     new RollEntry('address1', 10),
    //     new RollEntry('address2', 15),
    //   ];

    //   mockCurrentSlot(periodFromCycle(cycles[4]), 8);

    //   feedCycle(getRollsArgs(rollData, true));

    //   feedCycle(getRollsArgs(rollData, true));
    // });

    test('Feed cycle data successfully', () => {
      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
      ];

      mockCurrentSlot(periodFromCycle(cycles[1]), 8);

      feedCycle(getRollsArgs(rollData, true));

      const lastCycle = bytesToU64(Storage.get(LAST_CYCLE_TAG));
      expect(lastCycle).toBe(cycles[1]);

      const cycle = getKeys(recordedCycleKey(cycles[1]));
      expect(cycle.length).toBe(1);

      for (let i = 0; i < rollData.length; i++) {
        const valueBinary = Storage.get(
          rollKey(cycles[1], rollData[i].address),
        );

        const value = bytesToU64(valueBinary);
        expect(value).toBe(rollData[i].rolls);
      }
    });

    test('Update last cycle successfully', () => {
      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
        new RollEntry('address3', 20),
        new RollEntry('address4', 25),
      ];

      mockCurrentSlot(periodFromCycle(cycles[1]), 8);

      feedCycle(getRollsArgs(rollData, true));

      const lastCycle = bytesToU64(Storage.get(LAST_CYCLE_TAG));
      expect(lastCycle).toBe(cycles[1]);

      mockCurrentSlot(periodFromCycle(cycles[2]), 8);

      feedCycle(getRollsArgs(rollData, true));

      const lastCycle2 = bytesToU64(Storage.get(LAST_CYCLE_TAG));
      expect(lastCycle2).toBe(cycles[2]);
    });

    throws('Feed cycle fails if caller is not the owner', () => {
      switchUser(nonOwner);

      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
      ];

      mockCurrentSlot(periodFromCycle(cycles[1]), 8);

      feedCycle(getRollsArgs(rollData, true));
    });

    throws('Feed cycle fails if cycle already exists', () => {
      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
      ];

      mockCurrentSlot(periodFromCycle(cycles[1]), 8);

      feedCycle(getRollsArgs(rollData, true));

      feedCycle(getRollsArgs(rollData, true));
    });
  });

  describe('Delete Cycle Data', () => {
    test('Delete cycle data successfully', () => {
      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
        new RollEntry('address3', 15),
        new RollEntry('address4', 15),
        new RollEntry('address5', 15),
        new RollEntry('address6', 15),
        new RollEntry('address7', 15),
        new RollEntry('address8', 15),
      ];

      mockCurrentSlot(periodFromCycle(cycles[1]), 8);

      feedCycle(getRollsArgs(rollData, true));
      const lastCycle = bytesToU64(Storage.get(LAST_CYCLE_TAG));
      expect(lastCycle).toBe(cycles[1]);

      let rollKeys = getKeys(rollKeyPrefix(cycles[1]));
      for (let i = 0; i < rollKeys.length; i++) {
        expect(Storage.has(rollKeys[i])).toBeTruthy();
        const value = Storage.get(rollKeys[i]);
        expect(bytesToU64(value)).toBe(rollData[i].rolls);
      }

      let deleteArgs = new Args().add<u64>(cycles[1]).add<u64>(4);
      deleteCycle(deleteArgs.serialize());

      rollKeys = getKeys(rollKeyPrefix(cycles[1]));
      expect(rollKeys.length).toBe(4);

      deleteArgs = new Args().add<u64>(cycles[1]).add<u64>(4);
      deleteCycle(deleteArgs.serialize());

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
        new RollEntry('address1', 10),
        new RollEntry('address2', 20),
        new RollEntry('address3', 30),
        new RollEntry('address4', 40),
      ];

      mockCurrentSlot(periodFromCycle(cycles[1]), 8);

      feedCycle(getRollsArgs(rollData, true));

      for (let i = 0; i < rollData.length; i++) {
        const rolls = Storage.get(rollKey(cycles[1], rollData[i].address));
        expect(bytesToU64(rolls)).toBe(rollData[i].rolls);
      }
    });
  });
});
