/* eslint-disable camelcase */
import { Oracle } from './wrappers/Oracle';
import {
  getStakers,
  generateRollsEntries,
  feedRolls,
  deleteRolls,
  getCycleInfo,
  getCyclesToDelete,
} from './helpers';
import { getProvider } from '../utils';
import { JsonRpcProvider, Mas, NetworkName } from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';
import { contracts } from '../config';

// Constants
const BATCH_SIZE_FEED = 5000;
const BATCH_SIZE_DELETE = 4000;

interface NetworkConfig {
  provider: JsonRpcProvider;
  oracle: Oracle;
  networkName: string;
}

interface NetworkResult {
  success: boolean;
  error?: Error;
}

async function initialize(): Promise<{ buildnet: NetworkConfig; mainnet: NetworkConfig }> {
  const providerBuildnet = await getProvider('PRIVATE_KEY_BUILDNET');
  const providerMainnet = await getProvider('PRIVATE_KEY_MAINNET', true);

  const buildnet: NetworkConfig = {
    provider: providerBuildnet,
    oracle: new Oracle(providerBuildnet, contracts[NetworkName.Buildnet].oracle),
    networkName: NetworkName.Buildnet
  };

  const mainnet: NetworkConfig = {
    provider: providerMainnet,
    oracle: new Oracle(providerMainnet, contracts[NetworkName.Mainnet].oracle),
    networkName: NetworkName.Mainnet
  };

  console.log('Initializing feeder', {
    address: providerBuildnet.address,
    balance: Mas.toString(await providerBuildnet.balance()),
  });

  return { buildnet, mainnet };
}

async function processNetwork(
  network: NetworkConfig,
  rollEntries: any[],
  currentCycle: U64_t,
  cyclesToDelete: U64_t[]
): Promise<NetworkResult> {
  const { oracle, networkName } = network;

  try {
    // Get the last recorded cycle from the oracle
    const lastCycle = await oracle.getLastCycle();

    // Validate that the last recorded cycle is not in the future
    if (lastCycle > currentCycle) {
      const errorMessage = `Oracle on ${networkName} has recorded cycles in the future (lastCycle: ${lastCycle}, currentCycle: ${currentCycle}). This indicates a synchronization issue.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Feed rolls
    await feedRolls(oracle, rollEntries, currentCycle, BATCH_SIZE_FEED);

    // Verify records
    const nbRecord = await oracle.getNbRecordByCycle(currentCycle, true);
    console.log(`Rolls recorded on ${networkName}`, { count: nbRecord });

    if (nbRecord !== rollEntries.length) {
      const errorMessage = `Recorded rolls on ${networkName} (${nbRecord}) do not match generated rolls (${rollEntries.length})`;
      console.error(`Roll count mismatch on ${networkName}`, {
        expected: rollEntries.length,
        actual: nbRecord,
      });
      throw new Error(errorMessage);
    }

    // Delete old cycles
    if (cyclesToDelete.length === 0) {
      console.log(`No cycles to delete on ${networkName}`);
    } else {
      for (const cycle of cyclesToDelete) {
        const nbRecord = await oracle.getNbRecordByCycle(cycle, true);
        console.log(`Deleting rolls from ${networkName} cycle`, { cycle, recordCount: nbRecord });

        try {
          await deleteRolls(oracle, nbRecord, BATCH_SIZE_DELETE, cycle);
          console.log(`Successfully deleted rolls from ${networkName}`, { cycle });
        } catch (error: any) {
          console.error(`Failed to delete rolls from ${networkName}`, {
            cycle,
            error: error.message,
            stack: error.stack,
          });
          throw error;
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Error processing ${networkName}`, {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error };
  }
}

/**
 * Main feeder logic
 */
async function runFeeder(): Promise<void> {
  console.log('Starting feeder...');

  try {
    const { buildnet, mainnet } = await initialize();

    // Get cycle information from buildnet
    const lastCycle = await buildnet.oracle.getLastCycle();
    const recordedCycles = await buildnet.oracle.getRecordedCycles();
    const { currentCycle, remainingPeriods } = await getCycleInfo(
      mainnet.provider.client,
    );

    console.log('Cycle information', {
      lastCycle,
      currentCycle,
      recordedCycles,
      remainingPeriods,
    });

    // Early exit if no new cycle
    if (lastCycle >= currentCycle) {
      console.log('No new cycle to process', { remainingPeriods });
      return;
    }

    // Get stakers from mainnet
    const stakers = await getStakers(mainnet.provider);
    console.log('Stakers found', { count: stakers.length });

    const rollEntries = generateRollsEntries(stakers);
    const cyclesToDelete = getCyclesToDelete(recordedCycles);

    // Process both networks in parallel
    const [buildnetResult, mainnetResult] = await Promise.all([
      processNetwork(buildnet, rollEntries, currentCycle, cyclesToDelete),
      processNetwork(mainnet, rollEntries, currentCycle, cyclesToDelete)
    ]);

    // Check results and log errors if any failed
    const errors: string[] = [];
    if (!buildnetResult.success) {
      errors.push(`Buildnet failed: ${buildnetResult.error?.message}`);
    }
    if (!mainnetResult.success) {
      errors.push(`Mainnet failed: ${mainnetResult.error?.message}`);
    }

    if (errors.length > 0) {
      console.error('Feeder completed with errors:', errors.join('\n'));
    } else {
      console.log('Feeder finished successfully');
    }
  } catch (error: any) {
    console.error('Feeder error', {
      message: error.message,
      stack: error.stack,
    });
  }
}

// runFeeder();
// run every 10 seconds

setInterval(runFeeder, 10000);