// manageAutoRefresh

import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider } from '../utils';
import { Governance } from './wrapper/Governance';
const provider = await getProvider();


const governanceSystem = await Governance.init(provider);

const op = await governanceSystem.manageAutoRefresh(false, 0n, 0n);
const status = await op.waitSpeculativeExecution();

if (status !== OperationStatus.SpeculativeSuccess) {
    throw new Error('Failed to manage auto refresh');
}

console.log('Auto refresh managed');
