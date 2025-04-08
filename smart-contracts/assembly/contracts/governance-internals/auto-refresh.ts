import { u64ToBytes, bytesToU64, boolToByte, stringToBytes, byteToBool } from "@massalabs/as-types";
import { Storage, Context, currentPeriod, getKeys, asyncCall, Slot, generateEvent } from "@massalabs/massa-as-sdk";
import { _refresh } from ".";
import { statusKeyPrefix, votingStatus, discussionStatus } from "./keys";
import { AUTO_REFRESH_STATUS_KEY, START_REFETCH_PERIOD, LIMIT_REFETCH_PERIOD, ASC_START_PERIOD, ASC_END_PERIOD, MAX_ASYNC_CALL_GAS, MAX_ASYNC_CALL_FEE } from "./config";
// Auto refresh constants

export const MAX_ASYNC_CALL_GAS_KEY = stringToBytes('MAX_ASYNC_CALL_GAS');
export const MAX_ASYNC_CALL_FEE_KEY = stringToBytes('MAX_ASYNC_CALL_FEE');

/**
 * Refreshes the status of proposals based on the current timestamp.
 * @remarks This function moves proposals from discussion to votingStatus status
 * and from votingStatus to accepted or rejected status.
 */
export function _autoRefreshCall(): void {
    if (!byteToBool(Storage.get(AUTO_REFRESH_STATUS_KEY))) {
        generateEvent("ASC is not allowed")
        return
    }

    const currentPeriodStart = currentPeriod();
    const validityStartPeriod = currentPeriodStart + START_REFETCH_PERIOD;
    const validityStartThread = Context.currentThread();
    const validityEndPeriod = currentPeriodStart + LIMIT_REFETCH_PERIOD;
    const validityEndThread = Context.currentThread();

    // If no proposals in discussion or voting, we can stop the ASC
    const votingStatusProposalsKeys = getKeys(statusKeyPrefix(votingStatus));
    const discussionStatusProposalsKeys = getKeys(
        statusKeyPrefix(discussionStatus),
    );

    // If no proposals to refresh, we can stop the ASC
    // It will be restarted when a proposal is created
    if (
        votingStatusProposalsKeys.length === 0 &&
        discussionStatusProposalsKeys.length === 0
    ) {
        generateEvent('No proposals to refresh, stopping ASC');
        Storage.set(ASC_START_PERIOD, u64ToBytes(0));
        Storage.set(ASC_END_PERIOD, u64ToBytes(0));
        return;
    }

    const maxGas = Storage.has(MAX_ASYNC_CALL_GAS_KEY) ? bytesToU64(Storage.get(MAX_ASYNC_CALL_GAS_KEY)) : MAX_ASYNC_CALL_GAS;
    const maxFee = Storage.has(MAX_ASYNC_CALL_FEE_KEY) ? bytesToU64(Storage.get(MAX_ASYNC_CALL_FEE_KEY)) : MAX_ASYNC_CALL_FEE;

    asyncCall(
        Context.callee(), // target
        'runAutoRefresh', // functionName
        new Slot(validityStartPeriod, validityStartThread), // startSlot
        new Slot(validityEndPeriod, validityEndThread), // endSlot
        maxGas, // maxGas
        maxFee, // rawFee
    );

    Storage.set(ASC_END_PERIOD, u64ToBytes(validityEndPeriod));

    generateEvent(`New ASC started, validity period: ${validityStartPeriod} to ${validityEndPeriod}`);
}

/**
 * Checks if the last refetch period is older than the current period + LIMIT_REFETCH_PERIOD
 * If it is, it calls the runAutoRefresh function
 */
export function _ensureAutoRefresh(): void {
    const currentPeriod = Context.currentPeriod();
    // const lastStart = bytesToU64(Storage.get(ASC_START_PERIOD));
    const lastEnd = bytesToU64(Storage.get(ASC_END_PERIOD));

    if (currentPeriod > lastEnd) {
        // Expired ASC: refresh and restart
        _autoRefreshCall();
    } else {
        generateEvent(`No need to add new ASC, current period is ${currentPeriod}, and ASC limit period is: ${lastEnd}`);
    }
}

