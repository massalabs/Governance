import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { MasOg } from './wrapper/MasOg';

const provider = await getProvider();

const masOg = MasOg.buildnet(provider);

const bytecode = getScByteCode('build', 'masOg.wasm');
const op = await masOg.upgradeSC(bytecode);
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to submit proposal');
}

console.log('MasOg Contract upgraded');
