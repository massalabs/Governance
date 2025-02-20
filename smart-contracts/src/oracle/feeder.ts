/* eslint-disable camelcase */
import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';
import { Oracle } from './wrappers/Oracle';
import {
  getStakers,
  generateRolls,
  feedRolls,
  deleteRolls,
  getCycleInfo,
} from './helper';

dotenv.config();
const BATCH_SIZE_FEED = 5000;
const BATCH_SIZE_DELETE = 100;
const MAX_CYCLES = 5;

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);
const providerMainnet = Web3Provider.mainnet(account);
const oracle = Oracle.buildnet(provider);

async function main() {
  try {
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
    await feedRolls(oracle, rolls, currentCycle, BATCH_SIZE_FEED);

    // Verify recording
    let nbRecord = await oracle.getNbRecordByCycle(currentCycle, false);
    console.log('Recorded rolls:', nbRecord);

    if (nbRecord !== rolls.length) {
      // TODO: Implement a retry mechanism ?
      throw new Error('Recorded rolls do not match generated rolls');
    }

    // Manage cycle history
    const recordedCycles = await oracle.getRecordedCycles();
    console.log('Recorded cycles:', recordedCycles);

    // Delete old cycles and keep only the last 5
    const cyclesToDelete = recordedCycles
      .sort()
      .slice(0, recordedCycles.length - MAX_CYCLES);

    for (const cycle of cyclesToDelete) {
      nbRecord = await oracle.getNbRecordByCycle(cycle, false);
      console.log(`Deleting rolls from cycle ${cycle}`);
      await deleteRolls(oracle, nbRecord, BATCH_SIZE_DELETE, cycle);
      console.log(`Deleted rolls from cycles ${cycle}`);
    }
  } catch (error) {
    console.error('Error in main execution:', error);
    throw error;
  }
  console.log('Feeder finished\n');
}

main();
setInterval(main, 60 * 1000);
