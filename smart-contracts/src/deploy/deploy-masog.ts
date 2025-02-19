/* eslint-disable no-console */
import { Args, Mas, SmartContract } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';

console.log('Deploying masOg contract...');

const byteCode = getScByteCode('build', 'masOg.wasm');

const provider = await getProvider();
const contract = await SmartContract.deploy(provider, byteCode, new Args(), {
  coins: 10000n,
});

console.log('Contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
