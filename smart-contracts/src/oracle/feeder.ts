/* eslint-disable camelcase */
import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';
import { Oracle } from './wrappers/Oracle';
import {
  getStakers,
  generateRolls,
  getCurrentCycle,
  feedRolls,
  deleteRolls,
} from './helper';

// Configuration
dotenv.config();
const BATCH_SIZE_FEED = 5000;
const BATCH_SIZE_DELETE = 3000;
const MAX_CYCLES = 5n;

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);
const oracle = Oracle.buildnet(provider);

// Main execution
async function main() {
  try {
    // Fetch initial data
    const stakers = await getStakers(provider);
    const rolls = generateRolls(stakers);
    const lastCycle = await oracle.getLastCycle();
    const currentCycle = await getCurrentCycle(provider.client);

    console.log('Last cycle:', lastCycle);
    console.log('Current cycle:', currentCycle);
    if (lastCycle >= currentCycle) {
      console.log('Nothing to update');
      return;
    }

    // Process rolls
    await feedRolls(oracle, rolls, currentCycle, BATCH_SIZE_FEED);

    // Verify recording
    const recordedRolls = await oracle.getNbRecordedRolls(lastCycle, false);
    console.log(recordedRolls, rolls.length);
    if (recordedRolls !== rolls.length) {
      throw new Error('Recorded rolls do not match generated rolls');
    }

    // Manage cycle history
    const recordedCycles = await oracle.getRecordedCycles();
    console.log('Recorded cycles:', recordedCycles.sort());

    if (recordedCycles.length > 5) {
      await deleteRolls(
        oracle,
        recordedRolls,
        BATCH_SIZE_DELETE,
        recordedCycles[0],
      );
      console.log('Deleted rolls from 5 cycles ago');
    } else {
      console.log('No rolls to delete');
    }
  } catch (error) {
    console.error('Error in main execution:', error);
    throw error;
  }
}

main();
