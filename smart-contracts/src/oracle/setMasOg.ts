/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import { getProvider } from '../utils';

const provider = await getProvider();
const oracle = await Oracle.init(provider);

const op = await oracle.setMasOgAddress();

await op.waitSpeculativeExecution();
console.log('done');
