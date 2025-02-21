/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import {
  getStakers,
  generateRolls,
  feedRolls,
  deleteRolls,
  getCycleInfo,
  getCyclesToDelete,
} from './helper';
import { getProvider } from '../utils';
import { Mas } from '@massalabs/massa-web3';

// Constants
const BATCH_SIZE_FEED = 5000;
const BATCH_SIZE_DELETE = 4000;
const POLLING_INTERVAL_MS = 60 * 1000; // 1 minute

// Initialize providers and oracle
const provider = await getProvider();
const providerMainnet = await getProvider(true);
const oracle = await Oracle.init(provider);

// Log initial account info
console.log(
  `Account: ${provider.address} balance: ${Mas.toString(
    await provider.balance(),
  )}`,
);

/**
 * Main feeder logic
 */
async function runFeeder(): Promise<void> {
  console.log('Starting feeder...');

  try {
    // Fetch initial data
    const lastCycle = await oracle.getLastCycle();
    const recordedCycles = await oracle.getRecordedCycles();
    const { currentCycle, remainingPeriods } = await getCycleInfo(
      provider.client,
    );

    console.log('- Last cycle:', lastCycle);
    console.log('- Current cycle:', currentCycle);
    console.log('- Recorded cycles:', recordedCycles);

    // Check if we need to process a new cycle
    if (lastCycle >= currentCycle) {
      console.log('Remaining periods to next cycle:', remainingPeriods);
      console.log('');
      return;
    }

    // Process rolls
    const stakers = await getStakers(providerMainnet);
    const rolls = generateRolls(stakers);
    console.log(`Stakers found: ${stakers.length}`);

    await feedRolls(oracle, rolls, currentCycle, BATCH_SIZE_FEED);
    const nbRecord = await oracle.getNbRecordByCycle(currentCycle, true);
    console.log('Recorded rolls:', nbRecord);

    if (nbRecord !== rolls.length) {
      throw new Error('Recorded rolls do not match generated rolls');
      // TODO: Add retry logic here if needed
    }

    // Manage cycle history
    const cyclesToDelete = getCyclesToDelete(recordedCycles);
    if (cyclesToDelete.length === 0) {
      console.log('No cycles to delete');
    } else {
      for (const cycle of cyclesToDelete) {
        const nbRecord = await oracle.getNbRecordByCycle(cycle, true);
        console.log(`Deleting rolls from cycle ${cycle} (${nbRecord} records)`);
        await deleteRolls(oracle, nbRecord, BATCH_SIZE_DELETE, cycle);
        console.log(`Deleted rolls from cycle ${cycle}`);
      }
    }

    console.log('Feeder finished\n');
  } catch (error) {
    console.error('Feeder error:', error);
    throw error; // Re-throw to allow caller to handle or log
  }
}

// Start the feeder and set up polling (for local testing)
runFeeder();
// setInterval(() => runFeeder(), POLLING_INTERVAL_MS); // Uncomment for polling
