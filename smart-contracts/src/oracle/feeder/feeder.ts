import { JsonRpcProvider, NetworkName } from "@massalabs/massa-web3";
import { U64_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64";
import { Oracle } from "../wrapper/Oracle";
import { RollEntry } from "../serializable/RollEntry";
import { feedRolls, deleteRolls, getStakers, getCycleInfo, getCyclesToDelete, CycleInfo } from "./helpers";
import { log, logContarctCycleInfo, logFeederEnd, logFeederError, logFeederStart, logNetworkCycleInfo, logNoNewCycle, logSimpleError } from "./log";
import { AlertsService } from "./alerts";
import { Staker } from "@massalabs/massa-web3/dist/esm/generated/client-types";

export class Feeder {
    private provider: JsonRpcProvider;
    private oracle: Oracle;
    private networkName: NetworkName;
    private alerts?: AlertsService;

    constructor(
        provider: JsonRpcProvider,
        oracle: Oracle,
        networkName: NetworkName,
        alerts?: AlertsService
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
            console.log(`No cycles to delete on ${this.networkName}`);
            return;
        }

        for (const cycle of cyclesToDelete) {
            try {
                const recordCount = await this.oracle.getNbRecordByCycle(cycle, true);
                console.log(`Deleting rolls from ${this.networkName} cycle`, {
                    cycle,
                    recordCount,
                });

                await deleteRolls(this.oracle, recordCount, 4000n, cycle);
                console.log(`Successfully deleted rolls from ${this.networkName}`, { cycle });
            } catch (error) {
                throw new Error(`Failed to delete rolls for cycle ${cycle}: ${(error as Error).message}`);
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
                `Oracle on ${this.networkName} has recorded cycles in the future (lastCycle: ${lastCycle}, currentCycle: ${currentCycle}). This indicates a synchronization issue.`,
            );
        }

        log.info(`Feeding rolls for cycle ${currentCycle} on ${this.networkName}`);

        await feedRolls(this.oracle, rollEntries, currentCycle, 5000);

        const recordedCount = await this.oracle.getNbRecordByCycle(currentCycle, true);
        console.log(`Rolls recorded on ${this.networkName}`, { count: recordedCount });

        if (recordedCount !== BigInt(rollEntries.length)) {
            throw new Error(
                `Recorded rolls on ${this.networkName} (${recordedCount}) do not match generated rolls (${rollEntries.length})`,
            );
        }
    }

    public async feed(stakers: Staker[]): Promise<void> {
        logFeederStart(this.networkName);

        try {
            const [lastCycle, recordedCycles, cyclesInfo] = await Promise.all([
                this.oracle.getLastCycle(),
                this.oracle.getRecordedCycles(),
                getCycleInfo(this.provider),
            ]);

            logContarctCycleInfo(this.networkName, lastCycle, recordedCycles);
            logNetworkCycleInfo(this.networkName, cyclesInfo);

            // Early exit if no new cycle to process
            if (lastCycle >= cyclesInfo.currentCycle) {
                logNoNewCycle(this.networkName, cyclesInfo);
                return;
            }


            // log nb stakers and nb rollEntries

            const rollEntries = stakers.map((staker) =>
                RollEntry.create(staker[0], BigInt(staker[1])),
            );

            console.log(`Number of stakers: ${stakers.length}`);
            console.log(`Number of rollEntries: ${rollEntries.length}`);

            await this.handleFeedRolls({
                rollEntries,
                currentCycle: cyclesInfo.currentCycle,
                lastCycle,
            });

            const newRecordedCycles = await this.oracle.getRecordedCycles();
            await this.handleDeleteRolls(newRecordedCycles);

        } catch (error) {
            const errorMessage = (error as Error).message;
            if (ignoredErrors.some(err => errorMessage.includes(err))) {
                logSimpleError(`Cycle cannot be lower than the last cycle on ${this.networkName}`);
            } else {
                logFeederError(this.networkName, error as Error);
                if (this.alerts) {
                    await this.alerts.triggerAlert('feeder-failed', errorMessage, 'critical');
                }
                throw error;
            }
        } finally {
            logFeederEnd(this.networkName);
        }
    }
}

const ignoredErrors = ['Cycle cannot be lower than the last cycle'];