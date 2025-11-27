/* eslint-disable camelcase */
import { log } from './log';
import { Account, NetworkName, Web3Provider } from '@massalabs/massa-web3';
import { contracts } from '../../config';
import { Oracle } from '../wrapper/Oracle';
import { Feeder } from './feeder';
import { AlertsService } from './alerts';
import { getStakers } from './helpers';
import dotenv from 'dotenv';

dotenv.config();

const alertsService = new AlertsService();

async function main() {
  log.box('Starting Massa Governance Oracle Feeder', 'info');

  // === Accounts & Providers ===
  const accountMainnet = await Account.fromEnv('PRIVATE_KEY_MAINNET');
  const providerMainnet = Web3Provider.mainnet(accountMainnet);

  const accountBuildnet = await Account.fromEnv('PRIVATE_KEY_BUILDNET');
  const providerBuildnet = Web3Provider.buildnet(accountBuildnet);

  // === Balance check ===
  const balanceMainnet = await providerMainnet.balance();
  if (balanceMainnet < 1000n) {
    log.balanceLow(balanceMainnet);
    await alertsService.triggerAlert(
      'balance-low',
      `Balance of technical address is ${balanceMainnet} (< 1000)`,
      'critical',
    );
  }

  // === Initialize feeders ===
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

  const stakers = await getStakers(providerMainnet);
  log.stakerCount(stakers.length);

  // === Run feeders ===
  try {
    log.oracleAddress(
      NetworkName.Mainnet,
      contracts[NetworkName.Mainnet].oracle,
    );
    await mainnetFeeder.feed(stakers);
  } catch (err) {
    log.error(`Mainnet feeder failed: ${(err as Error).message}`);
  }

  try {
    log.oracleAddress(
      NetworkName.Buildnet,
      contracts[NetworkName.Buildnet].oracle,
    );
    await buildnetFeeder.feed(stakers);
  } catch (err) {
    log.error(`Buildnet feeder failed: ${(err as Error).message}`);
  }

  log.box('All feeders completed', 'success');
}

main().catch((err) => {
  log.error('Fatal error: ' + err.message);
  process.exit(1);
});
