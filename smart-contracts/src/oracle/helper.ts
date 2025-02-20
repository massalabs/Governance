/* eslint-disable camelcase */
import {
  Mas,
  OperationStatus,
  PublicAPI,
  Web3Provider,
} from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';
import {
  OutputEvents,
  Staker,
} from '@massalabs/massa-web3/dist/esm/generated/client-types';
import { RollEntry } from './serializable/RollEntry';
import { Oracle } from './wrappers/Oracle';
const AVERAGE_ROLL_STORAGE_COST = 62500000n;
const PERIODS_PER_CYCLE = 128n;

/**
 * Logs events to console * @param events - Array of output events to log
 */
export function logEvents(events: OutputEvents) {
  events.forEach((event) => console.log('Event message:', event.data));
}

/**
 * Feeds rolls data to oracle in batches
 * @param rolls - Array of roll entries to feed
 * @param cycle - Current cycle number
 * @param batchSize - Size of each batch
 */
export async function feedRolls(
  oracle: Oracle,
  rolls: RollEntry[],
  cycle: U64_t,
  batchSize: number,
) {
  for (let i = 0; i < rolls.length; i += batchSize) {
    const end = Math.min(i + batchSize, rolls.length);
    const batch = rolls.slice(i, end);
    const isLastBatch = end === rolls.length;

    const opFeed = await oracle.feedCycle(batch, cycle, isLastBatch, {
      coins: Mas.fromNanoMas(AVERAGE_ROLL_STORAGE_COST * BigInt(batchSize)),
      fee: Mas.fromString('0.1'),
    });

    const status = await opFeed.waitFinalExecution();
    if (status === OperationStatus.Error) {
      throw new Error(`Failed to feed batch ${i / batchSize + 1}`);
    }

    console.log(`Batch ${i / batchSize + 1} fed successfully`);
  }
}

/**
 * Deletes rolls from specified cycle in batches
 * @param recordedRolls - Total number of rolls to delete
 * @param batchSize - Size of each deletion batch
 * @param cycle - Cycle to delete from
 */
export async function deleteRolls(
  oracle: Oracle,
  recordedRolls: number,
  batchSize: number,
  cycle: bigint,
) {
  let remainingRolls = BigInt(recordedRolls);

  while (remainingRolls > 0) {
    const deleteBatchSize =
      remainingRolls > BigInt(batchSize) ? BigInt(batchSize) : remainingRolls;
    console.log('deleteBatchSize: ', deleteBatchSize);

    const opDeleteBatch = await oracle.deleteCycle(cycle, deleteBatchSize, {
      coins: Mas.fromString('0.1'),
    });
    await opDeleteBatch.waitSpeculativeExecution();
    const events = await opDeleteBatch.getSpeculativeEvents();
    logEvents(events);

    remainingRolls -= deleteBatchSize;
    console.log(
      `Deleted batch of ${deleteBatchSize} rolls, remaining: ${remainingRolls}`,
    );
  }
}

/**
 * Generates roll entries from staker data
 * @param stakers - Array of staker information
 * @returns Array of RollEntry objects
 */
export function generateRolls(stakers: Staker[]): RollEntry[] {
  return stakers.map((staker) =>
    RollEntry.create(staker[0], BigInt(staker[1])),
  );
}

/**
 * Fetches all stakers from the network
 * @returns Array of staker information
 */
export async function getStakers(provider: Web3Provider): Promise<Staker[]> {
  const stakers: Staker[] = [];
  let offset = 0;

  while (true) {
    const result = await provider.client.getStakers({ limit: 5000, offset });
    if (result.length === 0) break;
    stakers.push(...result);
    offset++;
  }

  return stakers;
}

// Helper function to calculate cycle from period
function calculateCycleFromPeriod(period: U64_t): U64_t {
  return period / PERIODS_PER_CYCLE;
}

// Helper function to calculate cycle start period
function calculateCycleStartPeriod(cycle: U64_t): U64_t {
  return cycle * PERIODS_PER_CYCLE;
}

/**
 * Gets the current cycle number
 * @param client - PublicAPI client instance
 * @returns Current cycle number
 */
export async function getCurrentCycle(client: PublicAPI): Promise<U64_t> {
  const currentPeriod = BigInt(await client.fetchPeriod());
  return calculateCycleFromPeriod(currentPeriod);
}

/**
 * Gets the start period of the next cycle
 * @param currentCycle - Current cycle number
 * @returns Next cycle start period
 */
export function getNextCycleStartPeriod(currentCycle: U64_t): U64_t {
  return calculateCycleStartPeriod(currentCycle + 1n);
}

/**
 * Calculates remaining periods until the next cycle
 * @param client - PublicAPI client instance
 * @returns Remaining periods
 */
export async function getRemainingPeriodsToNextCycle(
  client: PublicAPI,
): Promise<U64_t> {
  const currentPeriod = BigInt(await client.fetchPeriod());
  const currentCycle = calculateCycleFromPeriod(currentPeriod);
  const nextCycleStart = getNextCycleStartPeriod(currentCycle);

  console.log('currentPeriod:', currentPeriod);
  console.log('nextCycleStart:', nextCycleStart);

  return nextCycleStart - currentPeriod;
}

// Optional: Utility function to get all cycle info at once
export async function getCycleInfo(client: PublicAPI) {
  const currentPeriod = BigInt(await client.fetchPeriod());
  const currentCycle = calculateCycleFromPeriod(currentPeriod);
  const nextCycleStart = getNextCycleStartPeriod(currentCycle);
  const remainingPeriods = nextCycleStart - currentPeriod;

  return {
    currentPeriod,
    currentCycle,
    nextCycleStart,
    remainingPeriods,
  };
}
