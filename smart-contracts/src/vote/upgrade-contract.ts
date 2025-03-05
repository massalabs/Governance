import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { Voting } from './wrapper/Voting';

const provider = await getProvider();

const votingSystem = Voting.buildnet(provider);

const bytecode = getScByteCode('build', 'voting-system.wasm');
console.log(bytecode);
const op = await votingSystem.upgradeSC(bytecode);
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to submit proposal');
}

console.log('Voting System Contract upgraded');
