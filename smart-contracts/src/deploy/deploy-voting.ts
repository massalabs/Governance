/* eslint-disable no-console */
import {
  Args,
  Mas,
  OperationStatus,
  SmartContract,
} from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { Voting } from '../vote/wrapper/Voting';

console.log('Deploying voting contract...');

const byteCode = getScByteCode('build', 'voting-system.wasm');

const provider = await getProvider();
const contract = await SmartContract.deploy(provider, byteCode, new Args(), {
  coins: Mas.fromString('1'),
});

console.log('Voting contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}

// Set the masog address
console.log('Add Masog contract to voting:');
const op = await new Voting(provider, contract.address).setMasOgAddress();
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to set Masog contract address');
}

console.log('Done');
