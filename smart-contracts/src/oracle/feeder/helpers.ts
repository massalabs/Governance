/* eslint-disable camelcase */
import {
  Mas,
  OperationStatus,
  PublicAPI,
  Web3Provider,
} from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';
import {
  Staker,
} from '@massalabs/massa-web3/dist/esm/generated/client-types';
import { RollEntry } from '../serializable/RollEntry';
import { Oracle } from '../wrapper/Oracle';
import { AVERAGE_ROLL_STORAGE_COST, MAX_CYCLES, MAX_MINT_STORAGE_COST, PERIODS_PER_CYCLE, PERIOD_TIME } from './const';
import { log } from './log';


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
      coins: Mas.fromNanoMas(
        Mas.fromString('100') + // Will be refounded if 100 MAS are too much
        (AVERAGE_ROLL_STORAGE_COST + MAX_MINT_STORAGE_COST) *
        BigInt(batchSize),
      ),
      fee: Mas.fromString('0.1'),
    });

    const status = await opFeed.waitFinalExecution();
    if (status !== OperationStatus.Success && status !== OperationStatus.SpeculativeSuccess) {
      // TODO - if error, should we reset changes?
      throw new Error(`Failed to feed batch ${i / batchSize + 1} status: ${OperationStatus[status]}`);
    }

    console.log(`Batch ${i / batchSize + 1} fed successfully`);
  }

  log.success(`Rolls fed successfully for cycle ${cycle}`);
}

/**
 * Deletes rolls for a given cycle in batches, ensuring speculative execution success.
 * @param oracle - The oracle instance to interact with
 * @param recordedRolls - Total number of rolls to delete
 * @param batchSize - Maximum number of rolls to delete per batch
 * @param cycle - The cycle to delete rolls from
 * @param coins - Optional coin amount for the operation (default: 0.1 MAS)
 * @throws Error if batch deletion fails or input parameters are invalid
 */
export async function deleteRolls(
  oracle: Oracle,
  recordedRolls: bigint,
  batchSize: bigint,
  cycle: bigint,
  coins: string = '0.1',
): Promise<void> {
  // Input validation
  if (recordedRolls <= 0n) {
    console.log('No rolls to delete', { cycle, recordedRolls });
    return;
  }

  if (batchSize <= 0n) {
    throw new Error('Batch size must be greater than 0');
  }

  // Calculate number of batches
  const batchCount = (recordedRolls + batchSize - 1n) / batchSize;

  // Process each batch
  for (let batchIndex = 0n; batchIndex < batchCount; batchIndex++) {
    const currentBatchSize = batchIndex === batchCount - 1n
      ? recordedRolls - batchIndex * batchSize
      : batchSize;

    console.log('Deleting batch', { cycle, batchIndex, currentBatchSize });

    // Execute deletion
    const opDeleteBatch = await oracle.deleteCycle(cycle, currentBatchSize, {
      coins: Mas.fromString(coins)
    });

    // Wait for speculative execution
    const status = await opDeleteBatch.waitSpeculativeExecution();

    // Check operation status
    if (status !== OperationStatus.Success && status !== OperationStatus.SpeculativeSuccess) {
      throw new Error(`Failed to delete batch for cycle ${cycle} (batch ${batchIndex}, size ${currentBatchSize}): ${OperationStatus[status]}`);
    }

    console.log('Batch deleted successfully', { cycle, batchIndex, currentBatchSize });
  }

  console.log('Roll deletion completed', { cycle, recordedRolls });
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


export type CycleInfo = {
  currentPeriod: bigint;
  currentCycle: U64_t;
  nextCycleStart: bigint;
  remainingPeriods: bigint;
  remainingTime: bigint;
  remainingTimeInMinutes: bigint;
};
/**
 * Fetches cycle information from the network
 * @param client - PublicAPI client instance
 * @returns Cycle information
 */
export async function getCycleInfo(provider: Web3Provider): Promise<CycleInfo> {
  const currentPeriod = BigInt(await provider.client.fetchPeriod());
  const currentCycle = currentPeriod / PERIODS_PER_CYCLE;
  const nextCycleStart = (currentCycle + 1n) * PERIODS_PER_CYCLE;
  const remainingPeriods = nextCycleStart - currentPeriod;

  const remainingTime = remainingPeriods * PERIOD_TIME;
  const remainingTimeInMinutes = remainingTime / 60_000n;
  return {
    currentPeriod,
    currentCycle,
    nextCycleStart,
    remainingPeriods,
    remainingTime,
    remainingTimeInMinutes,
  };
}

/**
 * Determines cycles to delete, keeping the most recent MAX_CYCLES
 * @param recordedCycles - Array of cycle numbers
 * @returns Array of cycles to delete
 */
export function getCyclesToDelete(recordedCycles: bigint[]): bigint[] {
  if (recordedCycles.length <= MAX_CYCLES) return [];

  return recordedCycles
    .sort((a, b) => Number(a - b))
    .slice(0, recordedCycles.length - MAX_CYCLES);
}