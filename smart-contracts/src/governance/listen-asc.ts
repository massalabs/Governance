import { getProvider } from '../utils';
import { Governance } from './wrapper/Governance';

const provider = await getProvider();
const governanceSystem = await Governance.init(provider);

setInterval(async () => {
  const events = await governanceSystem.provider.getEvents({
    smartContractAddress: governanceSystem.address,
  });

  console.log('Events:', events.length);

  // Log last 5 events in a prettier format
  console.log('Last 5 events:');
  events.slice(-5).forEach((event, index) => {
    console.log(`\nEvent #${index + 1}:`);
    console.log(`  Operation ID: ${event.context.origin_operation_id}`);
    console.log(`  Block: ${event.context.block}`);
    console.log(`  Data: ${event.data}`);
  });

  const balance = await governanceSystem.provider.balanceOf([
    governanceSystem.address,
  ]);

  console.log('Balance:', balance[0].balance);
}, 10000);
