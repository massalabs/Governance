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
const AVERAGE_ROLL_STORAGE_COST = 6250000n;

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
    });

    const status = await opFeed.waitFinalExecution();
    if (status === OperationStatus.SpeculativeError) {
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
 * Generates roll entries from staker data
 * @param stakers - Array of staker information
 * @returns Array of RollEntry objects
 */
export function generateRolls(stakers: Staker[]): RollEntry[] {
  return stakers.map((staker) => new RollEntry(staker[0], BigInt(staker[1])));
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

/**
 * Calculates current cycle from period
 * @param client - PublicAPI client instance
 * @returns Current cycle number
 */
export async function getCurrentCycle(client: PublicAPI): Promise<U64_t> {
  const currentPeriod = await client.fetchPeriod();
  return BigInt(currentPeriod) / 128n;
}
