import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { Oracle } from './wrapper/Oracle';
import { getContracts } from '../config';

const provider = await getProvider();

const oracle = new Oracle(provider, getContracts().oracle);

const bytecode = getScByteCode('build', 'rolls-oracle.wasm');
const op = await oracle.upgradeSC(bytecode);
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to submit proposal');
}

console.log('Oracle Contract upgraded');
