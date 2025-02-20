/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import { getProvider } from '../utils';

const provider = await getProvider();
const oracle = await Oracle.init(provider);

const cycle = 17449n;

console.log(`Getting Rolls for cycle ${cycle} ...`);

// get recorded cycles
const recordedCycles = await oracle.getRecordedCycles();
console.log('Recorded cycles:', recordedCycles);

let recordedRolls = await oracle.getNbRecordByCycle(cycle, false);
console.log('Recorded rolls:', recordedRolls);
