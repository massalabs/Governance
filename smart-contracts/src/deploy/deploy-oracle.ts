/* eslint-disable no-console */
import { Args, Mas, SmartContract } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { deployMasOg } from './lib/masog';

console.log('Deploying rolls oracle contract...');

const byteCode = getScByteCode('build', 'rolls-oracle.wasm');

const provider = await getProvider();
const contract = await SmartContract.deploy(provider, byteCode, new Args(), {
  coins: Mas.fromString('30'),
  fee: Mas.fromString('0.1'),
});

console.log('Oracle contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}

const executedCommand = process.env.npm_lifecycle_event;

if (executedCommand === 'deploy:all') {
  await deployMasOg(contract.address);
}
