import { getProvider } from '../utils';
import { Governance } from './wrapper/Governance';

const provider = await getProvider();

const governanceSystem = await Governance.init(provider);

const counter = await governanceSystem.getCounter();
console.log('Counter:', counter);

// const op = await governanceSystem.runAutoRefresh();
// const status = await op.waitSpeculativeExecution();
// const events = await op.getSpeculativeEvents();

// console.log('Events:', events);

// if (status !== OperationStatus.SpeculativeSuccess) {
//   throw new Error('Failed to update proposal status');
// }

setInterval(async () => {
  const events = await governanceSystem.provider.getEvents({
    smartContractAddress: governanceSystem.address,
    callerAddress: governanceSystem.address,
  });
  console.log('Events:', events.length);

  const data = events[events.length - 1].data;
  // data should look like this: [Refetch called] from async message at 1716873600
  console.log(data);
  const timestamp = data.split('at ')[1];
  // convert to date
  const date = new Date(parseInt(timestamp));
  const formattedDate = date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  console.log('Date:', formattedDate);

  const balance = await governanceSystem.provider.balanceOf([
    governanceSystem.address,
  ]);

  console.log('Balance:', balance[0].balance);
}, 10000);
