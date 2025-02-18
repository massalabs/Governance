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
import { OutputEvents } from '@massalabs/massa-web3/dist/esm/generated/client-types';
dotenv.config();

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);

const oracle = Oracle.buildnet(provider);
const NB_STAKERS = 10000n;
const AVERAGE_ROLL_STORAGE_COST = 6250000n;
// TODO - Check why why 5000 is to much now
const BATCH_SIZE = 5000;

function logEvents(events: OutputEvents) {
  for (let event of events) {
    console.log('Event message:', event.data);
  }
}

/**
 * Feeds rolls data to the oracle in batches.
 * @param rolls - Array of RollEntry objects.
 * @param batchSize - Number of rolls to process in each batch.
 */
async function feedRolls(rolls: RollEntry[], batchSize: number) {
  for (let i = 0; i < rolls.length; i += batchSize) {
    const end = Math.min(i + batchSize, rolls.length);
    const batch = rolls.slice(i, end);
    const isLastBatch = end === rolls.length;

    const opFeed = await oracle.feedCycle(batch, isLastBatch, {
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
async function deleteRolls(
  recordedRolls: number,
  batchSize: number,
  cycle: bigint,
) {
  let remainingRolls = BigInt(recordedRolls);

  while (remainingRolls > 0) {
    const deleteBatchSize =
      remainingRolls > BigInt(batchSize) ? BigInt(batchSize) : remainingRolls;

    const opDeleteBatch = await oracle.deleteCycle(cycle, deleteBatchSize);

    const events = await opDeleteBatch.getSpeculativeEvents();

    logEvents(events);

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

  const lastCycle = await oracle.getLastCycle();
  console.log('Last Recorded cycle: ' + lastCycle);

  const recordedRolls = await oracle.getNbRecordedRolls(lastCycle, false);
  console.log('Recorded rolls: ' + recordedRolls);

  if (recordedRolls !== rolls.length) {
    throw new Error('Recorded rolls do not match');
  }

  await deleteRolls(recordedRolls, BATCH_SIZE, lastCycle);

  const recordedRollsAfterDelete = await oracle.getNbRecordedRolls(
    lastCycle,
    false,
  );

  console.log('Recorded rolls after delete: ' + recordedRollsAfterDelete);

  if (recordedRollsAfterDelete !== 0) {
    throw new Error('Recorded rolls after delete do not match');
  }
}

main();
