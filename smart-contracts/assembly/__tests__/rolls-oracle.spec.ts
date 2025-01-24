import {
  Args,
  bytesToString,
  bytesToU32,
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
  recordedCycleKey,
  feedCycle,
  ownerAddress,
  rollKey,
  LAST_CYCLE_TAG,
  deleteCycle,
} from '../contracts/rolls-oracle';
import { RollEntry } from '../contracts/roll-entry';

export const contractAddress =
  'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

export function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddress);
}
const owner = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const nonOwner = 'AU1NonOwnerExampleAddress';
const cycles = [0, 1, 2, 3, 4];

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
    throws('Feed cycle fails if new cycle lower than last cycle', () => {
      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
      ];

      const args = new Args()
        .add<u32>(cycles[4])
        .addSerializableObjectArray<RollEntry>(rollData);

      feedCycle(args.serialize());

      const args2 = new Args()
        .add<u32>(cycles[1])
        .addSerializableObjectArray<RollEntry>(rollData);

      feedCycle(args2.serialize());
    });

    throws('Feed cycle fails if caller is not the owner', () => {
      switchUser(nonOwner);

      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
      ];

      const args = new Args()
        .add<u32>(cycles[1])
        .addSerializableObjectArray<RollEntry>(rollData);

      feedCycle(args.serialize());
    });

    test('Feed cycle data successfully', () => {
      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
      ];

      const args = new Args()
        .add<u32>(cycles[1])
        .addSerializableObjectArray<RollEntry>(rollData);

      feedCycle(args.serialize());

      const lastCycle = bytesToU32(Storage.get(LAST_CYCLE_TAG));
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

      const args = new Args()
        .add<u32>(cycles[1])
        .addSerializableObjectArray<RollEntry>(rollData);

      feedCycle(args.serialize());

      const lastCycle = bytesToU32(Storage.get(LAST_CYCLE_TAG));
      expect(lastCycle).toBe(cycles[1]);

      const args2 = new Args()
        .add<u32>(cycles[2])
        .addSerializableObjectArray<RollEntry>(rollData);

      feedCycle(args2.serialize());

      const lastCycle2 = bytesToU32(Storage.get(LAST_CYCLE_TAG));
      expect(lastCycle2).toBe(cycles[2]);
    });
  });

  describe('Delete Cycle Data', () => {
    test('Delete cycle data successfully', () => {
      const rollData: RollEntry[] = [
        new RollEntry('address1', 10),
        new RollEntry('address2', 15),
      ];

      const args = new Args()
        .add<u32>(cycles[1])
        .addSerializableObjectArray<RollEntry>(rollData);

      feedCycle(args.serialize());

      const deleteArgs = new Args().add<u32>(cycles[1]);
      deleteCycle(deleteArgs.serialize());

      for (let i = 0; i < rollData.length; i++) {
        expect(
          Storage.has(rollKey(cycles[1], rollData[i].address)),
        ).toBeFalsy();
      }
    });

    throws('Delete cycle fails if caller is not the owner', () => {
      switchUser(nonOwner);

      const deleteArgs = new Args().add<u32>(cycles[1]);
      deleteCycle(deleteArgs.serialize());
    });

    throws('Delete cycle fails if cycle does not exist', () => {
      const deleteArgs = new Args().add<u32>(cycles[1]);
      deleteCycle(deleteArgs.serialize());
    });
  });
});
