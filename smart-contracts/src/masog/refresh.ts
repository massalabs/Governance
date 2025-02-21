import { Account, Mas, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';
import { MasOg } from '../masog/wrapper/MasOg';

dotenv.config();

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);
const masOg = MasOg.buildnet(provider);

async function main() {
  try {
    const refreshOp = await masOg.refresh(Mas.fromString("O.1"));
    await refreshOp.waitSpeculativeExecution();
    const events = await refreshOp.getSpeculativeEvents();
    console.log('Refreshed masOg:', events);
  } catch (error) {
    console.error('Error in main execution:', error);
    throw error;
  }
  console.log('Feeder finished\n');
}

main();
