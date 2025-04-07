import { getProvider } from '../utils';
import { Governance } from './wrapper/Governance';
import chalk from 'chalk';

const provider = await getProvider();
const governanceSystem = await Governance.init(provider);

setInterval(async () => {

  const period = await provider.getNodeStatus();
  console.log(chalk.cyan('Period:'), chalk.yellow(period.currentTime));

  const events = await governanceSystem.provider.getEvents({
    smartContractAddress: governanceSystem.address,
  });

  console.log(chalk.cyan('Events:'), chalk.yellow(events.length));

  // Log last 15 events in a prettier format
  console.log(chalk.cyan('\nLast 15 events:'));
  events.slice(-15).forEach((event, _, array) => {
    const actualIndex = events.length - (array.length - _);
    console.log(chalk.green(`\nEvent #${actualIndex + 1}:`));
    console.log(chalk.blue(`  Operation ID: ${event.context.origin_operation_id}`));
    console.log(chalk.magenta(`  Block: ${event.context.block}`));
    console.log(chalk.yellow(`  Data: ${event.data}`));
  });

  const balance = await governanceSystem.provider.balanceOf([
    governanceSystem.address,
  ]);

  console.log(chalk.cyan('\nBalance:'), chalk.green(balance[0].balance));
}, 10000);
