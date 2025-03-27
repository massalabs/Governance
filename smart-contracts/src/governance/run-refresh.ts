import { getProvider } from '../utils';
import { Governance } from './wrapper/Governance';

const provider = await getProvider();

const governanceSystem = await Governance.init(provider);

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

  const balance = await governanceSystem.provider.balanceOf([
    governanceSystem.address,
  ]);

  console.log('Balance:', balance[0].balance);
}, 5000);
