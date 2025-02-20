/* eslint-disable camelcase */
import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';
import { Oracle } from './wrappers/Oracle';

dotenv.config();

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);
const oracle = Oracle.buildnet(provider);

const cycle = 17449n;

async function main() {
  console.log(`Getting Rolls for cycle ${cycle} ...`);

  // get recorded cycles
  const recordedCycles = await oracle.getRecordedCycles();
  console.log('Recorded cycles:', recordedCycles);

  let recordedRolls = await oracle.getNbRecordByCycle(cycle, false);
  console.log('Recorded rolls:', recordedRolls);
}

main();
