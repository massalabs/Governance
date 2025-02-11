// TODO - Directly fetch rolls data from api
import {
  Account,
  Mas,
  OperationStatus,
  Web3Provider,
} from '@massalabs/massa-web3';
import { Oracle } from '../wrappers/Oracle';
import * as dotenv from 'dotenv';
import { RollEntry } from '../serializable/RollEntry';
dotenv.config();

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);

const oracle = Oracle.buildnet(provider);
const cycle = 1n;
const NB_STAKERS = 42000n;
const AVERAGE_ROLL_STORAGE_COST = 6250000n;
const BATCH_SIZE = 5000;

/**
 * Feeds rolls data to the oracle in batches.
 * @param rolls - Array of RollEntry objects.
 * @param batchSize - Number of rolls to process in each batch.
 */
async function feedRolls(rolls: RollEntry[], batchSize: number) {
  for (let i = 0; i < rolls.length; i += batchSize) {
    const end = Math.min(i + batchSize, rolls.length);
    const batch = rolls.slice(i, end);

    const opFeed = await oracle.feedCycle(cycle, batch, {
      coins: Mas.fromNanoMas(AVERAGE_ROLL_STORAGE_COST * BigInt(batchSize)),
    });

    const status = await opFeed.waitFinalExecution();

    if (status === OperationStatus.SpeculativeError) {
      throw new Error('Failed to feed batch');
    }

    console.log('Batch fed successfully');
  }
}

/**
 * Deletes rolls data from the oracle in batches.
 * @param recordedRolls - Total number of recorded rolls.
 * @param batchSize - Number of rolls to delete in each batch.
 */
async function deleteRolls(recordedRolls: number, batchSize: number) {
  let remainingRolls = BigInt(recordedRolls);
  while (remainingRolls > 0) {
    const deleteBatchSize =
      remainingRolls > BigInt(batchSize) ? BigInt(batchSize) : remainingRolls;
    const opDeleteBatch = await oracle.deleteCycle(cycle, deleteBatchSize, {
      coins: Mas.fromString('1'),
    });

    await opDeleteBatch.waitSpeculativeExecution();

    remainingRolls -= deleteBatchSize;
    console.log(
      `Deleted batch of ${deleteBatchSize} rolls, remaining: ${remainingRolls}`,
    );
  }
}

/**
 * Generates an array of RollEntry objects.
 * @param nbStakers - Number of stakers.
 * @returns Array of RollEntry objects.
 */
function generateRolls(nbStakers: bigint): RollEntry[] {
  const rolls = [];
  for (let i = 1n; i <= nbStakers; i++) {
    rolls.push(new RollEntry(`AU${i}ExampleAddress`, 10n + i));
  }
  return rolls;
}

/**
 * Main function to execute the feeding and deleting of rolls.
 */
async function main() {
  const rolls = generateRolls(NB_STAKERS);

  await feedRolls(rolls, BATCH_SIZE);

  const recordedRolls = await oracle.getNbRecordedRolls(cycle, false);
  console.log('Recorded rolls: ' + recordedRolls);

  if (recordedRolls !== rolls.length) {
    throw new Error('Recorded rolls do not match');
  }

  await deleteRolls(recordedRolls, BATCH_SIZE);

  const recordedRollsAfterDelete = await oracle.getNbRecordedRolls(
    cycle,
    false,
  );
  console.log('Recorded rolls after delete: ' + recordedRollsAfterDelete);

  if (recordedRollsAfterDelete !== 0) {
    throw new Error('Recorded rolls after delete do not match');
  }
}

main();
