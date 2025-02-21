/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import { getProvider } from '../utils';
import { getStakers } from './helper';
import { MasOg } from '../masog/wrapper/MasOg';

const provider = await getProvider();
const providerMainnet = await getProvider(true);
const oracle = await Oracle.init(provider);
const masOg = MasOg.buildnet(provider);
const decimal = await masOg.decimals();

const recordedCycles = await oracle.getRecordedCycles();
const cycle = recordedCycles[recordedCycles.length - 1];

console.log(`Start getting data for cycle ${cycle}...`);

console.log('- Recorded cycles:', recordedCycles);

let recordedRolls = await oracle.getNbRecordByCycle(cycle, false);
console.log(`- Recorded rolls for cycle ${cycle}:`, recordedRolls);

const stakers = await getStakers(providerMainnet);

for (let i = 0; i < 5; i++) {
  const balance = await masOg.balanceOf(stakers[i][0]);

  console.table(
    [
      {
        Staker: stakers[i][0],
        Rolls: stakers[i][1],
        MasOg: balance / BigInt(decimal),
      },
    ],
    ['Staker', 'Rolls', 'MasOg'],
  );
}

const masOgTotalSupply = await masOg.totalSupply();
console.log('Total supply of MasOg:', masOgTotalSupply / BigInt(decimal));
