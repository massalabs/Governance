import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { MasOg } from './wrapper/MasOg';
import { getContracts } from '../config';

const provider = await getProvider();
const masOg = new MasOg(provider, getContracts().masOg);

const bytecode = getScByteCode('build', 'masOg.wasm');
const op = await masOg.upgradeSC(bytecode);
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to submit proposal');
}

console.log('MasOg Contract upgraded');
