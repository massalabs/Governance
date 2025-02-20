/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import { deleteRolls } from './helper';
import { getProvider } from '../utils';

const BATCH_SIZE_DELETE = 4000;

const provider = await getProvider();
const oracle = await Oracle.init(provider);
const cycleToDelete = 17450n;

async function deleteCycle() {
  try {
    const recordedCycles = await oracle.getRecordedCycles();
    console.log('Recorded cycles:', recordedCycles);
    // TODO: Should we add a key in storage to get the nb of rolls per cycle?
    const nbRecord = await oracle.getNbRecordByCycle(cycleToDelete, false);
    console.log('Recorded rolls to delete:', nbRecord);
    await deleteRolls(oracle, nbRecord, BATCH_SIZE_DELETE, cycleToDelete);
    console.log('Deleted rolls from 5 cycles ago');
  } catch (error) {
    console.error('Error in main execution:', error);
    throw error;
  }
}

deleteCycle();
