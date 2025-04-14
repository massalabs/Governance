/* eslint-disable no-console */
import { getContracts } from '../config';
import { deployGovernance } from './lib/governance';

const masOgAddress = getContracts().masOg;

if (!masOgAddress) {
    throw new Error('MasOg address is not set');
}

await deployGovernance(masOgAddress);

