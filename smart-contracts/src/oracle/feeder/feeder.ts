/* eslint-disable max-len */
/* eslint-disable camelcase */

import { JsonRpcProvider, NetworkName } from '@massalabs/massa-web3';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';
import { Oracle } from '../wrapper/Oracle';
import { RollEntry } from '../serializable/RollEntry';
import {
  feedRolls,
  deleteRolls,
  getCycleInfo,
  getCyclesToDelete,
} from './helpers';
import { log } from './log'; // ← New unified logger
import { AlertsService } from './alerts';
import { Staker } from '@massalabs/massa-web3/dist/esm/generated/client-types';

const GOVERNANCE_ORACLE_ALERT_NAME = 'governance-oracle';

const ignoredErrors = ['Cycle cannot be lower than the last cycle'];

export class Feeder {
  private provider: JsonRpcProvider;
  private oracle: Oracle;
  private networkName: NetworkName;
  private alerts?: AlertsService;

  constructor(
    provider: JsonRpcProvider,
    oracle: Oracle,
    networkName: NetworkName,
    alerts?: AlertsService,
  ) {
    this.provider = provider;
    this.oracle = oracle;
    this.networkName = networkName;
    this.alerts = alerts;
    if (this.alerts) {
      this.alerts.setNetwork(networkName);
    }
  }

  private async handleDeleteRolls(recordedCycles: bigint[]): Promise<void> {
    const cyclesToDelete = getCyclesToDelete(recordedCycles);

    if (cyclesToDelete.length === 0) {
      log.info(`No old cycles to delete on ${this.networkName}`);
      return;
    }

    for (const cycle of cyclesToDelete) {
      try {
        const recordCount = await this.oracle.getNbRecordByCycle(cycle, true);

        log.deletingCycle(this.networkName, cycle, recordCount);
        await deleteRolls(this.oracle, recordCount, 4000n, cycle);
        log.deletedCycle(this.networkName, cycle);
      } catch (error) {
        throw new Error(
          `Failed to delete rolls for cycle ${cycle} on ${this.networkName}: ${
            (error as Error).message
          }`,
        );
      }
    }
  }

  private async handleFeedRolls({
    rollEntries,
    currentCycle,
    lastCycle,
  }: {
    rollEntries: RollEntry[];
    currentCycle: U64_t;
    lastCycle: U64_t;
  }): Promise<void> {
    if (lastCycle > currentCycle) {
      throw new Error(
        `Oracle on ${this.networkName} has recorded cycles in the future ` +
          `(lastCycle: ${lastCycle}, currentCycle: ${currentCycle}). This indicates a synchronization issue.`,
      );
    }

    log.feedingCycle(this.networkName, currentCycle);
    await feedRolls(this.oracle, rollEntries, currentCycle, 5000);

    const recordedCount = await this.oracle.getNbRecordByCycle(
      currentCycle,
      true,
    );
    log.rollsRecorded(this.networkName, rollEntries.length, recordedCount);

    if (recordedCount !== BigInt(rollEntries.length)) {
      throw new Error(
        `Recorded rolls mismatch on ${this.networkName}: ` +
          `expected ${rollEntries.length}, got ${recordedCount}`,
      );
    }
  }

  public async feed(stakers: Staker[]): Promise<void> {
    log.startFeeder(this.networkName);

    try {
      const [lastCycle, recordedCycles, cycleInfo] = await Promise.all([
        this.oracle.getLastCycle(),
        this.oracle.getRecordedCycles(),
        getCycleInfo(this.provider.client),
      ]);

      log.contractCycleInfo(this.networkName, lastCycle, recordedCycles);
      log.networkCycleInfo(this.networkName, cycleInfo);

      // Early exit: nothing to do
      if (lastCycle >= cycleInfo.currentCycle) {
        log.noNewCycle(this.networkName, cycleInfo);
        return;
      }

      // Generate roll entries
      const rollEntries = stakers.map((staker) =>
        RollEntry.create(staker[0], BigInt(staker[1])),
      );

      log.stakerCount(stakers.length);
      log.info(
        `Generated ${rollEntries.length} roll entries for cycle ${cycleInfo.currentCycle}`,
      );

      // Feed new cycle
      await this.handleFeedRolls({
        rollEntries,
        currentCycle: cycleInfo.currentCycle,
        lastCycle,
      });

      // Clean up old cycles
      const newRecordedCycles = await this.oracle.getRecordedCycles();
      await this.handleDeleteRolls(newRecordedCycles);

      // Resolve any pending alerts (success case)
      if (this.alerts) {
        await this.alerts.resolveAlerts();
      }
    } catch (error) {
      const msg = (error as Error)?.message || String(error);

      // Gracefully skip already-processed cycles
      if (ignoredErrors.some((e) => msg.includes(e))) {
        log.warn(`Skipped (already processed): ${msg}`);
        return;
      }

      // Real error → log + alert
      log.error(`Feeder failed on ${this.networkName}: ${msg}`);
      if (this.alerts) {
        await this.alerts.triggerAlert(
          GOVERNANCE_ORACLE_ALERT_NAME,
          msg,
          'critical',
        );
      }
      throw error; // re-throw so caller knows it failed
    } finally {
      log.endFeeder(this.networkName);
    }
  }
}
