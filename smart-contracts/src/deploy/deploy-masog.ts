import { getContracts } from '../config';
import { deployMasOg } from './lib/masog';

const oracleAddress = getContracts().oracle;

if (!oracleAddress) {
    throw new Error('Oracle address is not set');
}

await deployMasOg(oracleAddress);
