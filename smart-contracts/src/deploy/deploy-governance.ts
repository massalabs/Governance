/* eslint-disable no-console */
import {
  Args,
  Mas,
  OperationStatus,
  SmartContract,
} from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { Governance } from '../governance/wrapper/Governance';

console.log('Deploying governance contract...');

const byteCode = getScByteCode('build', 'governance.wasm');

const provider = await getProvider();
const contract = await SmartContract.deploy(provider, byteCode, new Args(), {
  coins: Mas.fromString('1'),
});

console.log('Governance contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}

// Set the masog address
console.log('Add Masog contract to governance:');
const op = await new Governance(provider, contract.address).setMasOgAddress();
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to set Masog contract address');
}

console.log('Done');
