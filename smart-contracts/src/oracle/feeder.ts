/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import {
  getStakers,
  generateRollsEntries,
  feedRolls,
  deleteRolls,
  getCycleInfo,
  getCyclesToDelete,
} from './helpers';
import { getProvider } from '../utils';
import { JsonRpcProvider, Mas } from '@massalabs/massa-web3';
import logger from '../utils/logger';

// Constants
const BATCH_SIZE_FEED = 5000;
const BATCH_SIZE_DELETE = 4000;

async function initialize() {
  const provider = await getProvider();
  const providerMainnet = await getProvider(undefined, true);
  const oracle = await Oracle.init(provider);

  logger.info('Initializing feeder', {
    address: provider.address,
    balance: Mas.toString(await provider.balance()),
  });

  return { provider, providerMainnet, oracle };
}

/**
 * Main feeder logic
 */
async function runFeeder(): Promise<void> {
  logger.info('Starting feeder...');

  let provider: JsonRpcProvider, providerMainnet: JsonRpcProvider, oracle: Oracle;

  try {
    ({ provider, providerMainnet, oracle } = await initialize());

    const lastCycle = await oracle.getLastCycle();
    const recordedCycles = await oracle.getRecordedCycles();
    const { currentCycle, remainingPeriods } = await getCycleInfo(
      provider.client,
    );

    logger.info('Cycle information', {
      lastCycle,
      currentCycle,
      recordedCycles,
      remainingPeriods,
    });

    // Early exit if no new cycle
    if (lastCycle >= currentCycle) {
      logger.info('No new cycle to process', { remainingPeriods });
      return;
    }

    // Process rolls
    const stakers = await getStakers(providerMainnet);
    logger.info('Stakers found', { count: stakers.length });

    const rollEntries = generateRollsEntries(stakers);
    await feedRolls(oracle, rollEntries, currentCycle, BATCH_SIZE_FEED);

    const nbRecord = await oracle.getNbRecordByCycle(currentCycle, true);
    logger.info('Rolls recorded', { count: nbRecord });

    if (nbRecord !== rollEntries.length) {
      const errorMessage = `Recorded rolls (${nbRecord}) do not match generated rolls (${rollEntries.length})`;
      logger.error('Roll count mismatch', {
        expected: rollEntries.length,
        actual: nbRecord,
      });
      throw new Error(errorMessage);
    }

    // Manage cycle history
    const cyclesToDelete = getCyclesToDelete(recordedCycles);
    if (cyclesToDelete.length === 0) {
      logger.info('No cycles to delete');
    } else {
      for (const cycle of cyclesToDelete) {
        const nbRecord = await oracle.getNbRecordByCycle(cycle, true);
        logger.info('Deleting rolls from cycle', { cycle, recordCount: nbRecord });

        try {
          await deleteRolls(oracle, nbRecord, BATCH_SIZE_DELETE, cycle);
          logger.info('Successfully deleted rolls', { cycle });
        } catch (error: any) {
          logger.error('Failed to delete rolls', {
            cycle,
            error: error.message,
            stack: error.stack,
          });
          throw error;
        }
      }
    }

    logger.info('Feeder finished successfully');
  } catch (error: any) {
    logger.error('Feeder error', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

runFeeder();