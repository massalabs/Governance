import { Mas } from '@massalabs/massa-web3';
import { MasOg } from './wrapper/MasOg';
import { getProvider } from '../utils';

const provider = await getProvider();
const masOg = await MasOg.init(provider);

const refreshOp = await masOg.refresh(Mas.fromMas(60n));
await refreshOp.waitSpeculativeExecution();
const events = await refreshOp.getSpeculativeEvents();
console.log(
  'Refreshed masOg:',
  events.map((e) => e.data),
);

console.log('Feeder finished\n');
