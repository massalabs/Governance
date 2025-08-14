/* eslint-disable camelcase */
import { log, logWithDivider } from './log';
import { Account, NetworkName, Web3Provider } from '@massalabs/massa-web3';
import { contracts } from '../../config';
import { Oracle } from '../wrapper/Oracle';
import { Feeder } from './feeder';
import { AlertsService } from './alerts';
import { getStakers } from './helpers';
import dotenv from 'dotenv';

dotenv.config();

const alertsService = new AlertsService();

/**
 * Main feeder execution logic
 */
async function main() {
  log.info('*#----- Starting feeder -----#*');
  const accountMainnet = await Account.fromEnv('PRIVATE_KEY_MAINNET');
  const providerMainnet = Web3Provider.mainnet(accountMainnet);

  const accountBuildnet = await Account.fromEnv('PRIVATE_KEY_BUILDNET');
  const providerBuildnet = Web3Provider.buildnet(accountBuildnet);

  // TODO - Alerte Balance if lower than 1000
  const balanceMainnet = await providerMainnet.balance();
  if (balanceMainnet < 1000n) {
    await alertsService.triggerAlert(
      'balance-low',
      'Balance of technical address is lower than 1000',
      'critical',
    );
  }

  const mainnetFeeder = new Feeder(
    providerMainnet,
    new Oracle(providerMainnet, contracts[NetworkName.Mainnet].oracle),
    NetworkName.Mainnet,
    alertsService,
  );

  const buildnetFeeder = new Feeder(
    providerBuildnet,
    new Oracle(providerBuildnet, contracts[NetworkName.Buildnet].oracle),
    NetworkName.Buildnet,
    undefined,
  );

  // log contracts addresses
  log.info(
    `Mainnet Oracle Contract Address: ${contracts[NetworkName.Mainnet].oracle}`,
  );
  log.info(
    `Buildnet Oracle Contract Address: ${
      contracts[NetworkName.Buildnet].oracle
    }`,
  );

  const stakers = await getStakers(providerMainnet);

  // TODO: If mainnet feeder fails, buildnet is not executed
  await mainnetFeeder.feed(stakers);
  // await buildnetFeeder.feed(stakers);

  logWithDivider('All feeders finished successfully', 'success');
}

main();
