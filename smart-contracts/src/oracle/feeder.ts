/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import {
  getStakers,
  generateRolls,
  feedRolls,
  deleteRolls,
  getCycleInfo,
} from './helper';
import { getProvider } from '../utils';
import { Mas } from '@massalabs/massa-web3';

const BATCH_SIZE_FEED = 5000;
const BATCH_SIZE_DELETE = 4000;
const MAX_CYCLES = 5;

const provider = await getProvider();
const providerMainnet = await getProvider(true);
const oracle = await Oracle.init(provider);

console.log(`Account: ${provider.address} balance: ${Mas.toString(await provider.balance())}`, );

async function main() {
  console.log('Starting feeder...');
  // Fetch initial data

  const lastCycle = await oracle.getLastCycle();
  const { currentCycle, remainingPeriods } = await getCycleInfo(
    provider.client,
  );

  console.log('- Last cycle:', lastCycle);
  console.log('- Current cycle:', currentCycle);

  if (lastCycle >= currentCycle) {
    console.log('Remaining periods to next cycle:', remainingPeriods);
    console.log('');
    return;
  }

  const stakers = await getStakers(providerMainnet);
  const rolls = generateRolls(stakers);
  console.log(stakers.length, 'stakers found');

  // Process rolls
  try {
    await feedRolls(oracle, rolls, currentCycle, BATCH_SIZE_FEED);

    // Verify recording
    let nbRecord = await oracle.getNbRecordByCycle(currentCycle, true);
    console.log('Recorded rolls:', nbRecord);

    if (nbRecord !== rolls.length) {
      // TODO: Implement a retry mechanism ?
      throw new Error('Recorded rolls do not match generated rolls');
    }
  } catch (error) {
    console.error('Error feeding rolls:', error);
    throw error;
  }

  // Manage cycle history
  const recordedCycles = await oracle.getRecordedCycles();
  console.log('Recorded cycles:', recordedCycles);

  // Delete old cycles and keep only the last 5
  const cyclesToDelete = recordedCycles
    .sort()
    .slice(0, recordedCycles.length - MAX_CYCLES);

  for (const cycle of cyclesToDelete) {
    try {
      const nbRecord = await oracle.getNbRecordByCycle(cycle, true);
      console.log(`Deleting rolls from cycle ${cycle}`);
      await deleteRolls(oracle, nbRecord, BATCH_SIZE_DELETE, cycle);
      console.log(`Deleted rolls from cycles ${cycle}`);
    } catch (error) {
      console.error(`Error deleting rolls from cycle ${cycle}:`, error);
      throw error;
    }
  }

  // Refresh masOg
  // try {
  //   const refreshOp = await masOg.refresh(Mas.fromString('0.1'));
  //   await refreshOp.waitSpeculativeExecution();
  //   const events = await refreshOp.getSpeculativeEvents();
  //   console.log('Refreshed masOg:', events);
  // } catch (error) {
  //   console.error('Error refreshing masOg:', error);
  //   throw error;
  // }

  console.log('Feeder finished\n');
}

main();
// setInterval(main, 60 * 1000); Only for local testing
