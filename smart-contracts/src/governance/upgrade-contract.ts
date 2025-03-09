import { Mas, OperationStatus } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { Governance } from './wrapper/Governance';

const provider = await getProvider();

const governanceSystem = Governance.buildnet(provider);

const bytecode = getScByteCode('build', 'governance.wasm');

const op = await governanceSystem.upgradeSC(bytecode, {
  coins: Mas.fromString('10'),
});

const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to submit proposal');
}

console.log('Governance System Contract upgraded');
