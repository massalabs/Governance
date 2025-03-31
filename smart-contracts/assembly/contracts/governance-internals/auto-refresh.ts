import { u64ToBytes, bytesToU64, boolToByte, stringToBytes } from "@massalabs/as-types";
import { Storage, Context, currentPeriod, getKeys, asyncCall, Slot } from "@massalabs/massa-as-sdk";
import { _refresh } from ".";
import { statusKeyPrefix, votingStatus, discussionStatus } from "./keys";
// Auto refresh constants
export const AUTO_REFRESH_STATUS_KEY = stringToBytes('auto_refresh');
export const LAST_REFETCH_PERIOD_TAG = stringToBytes('last_refetch_timestamp');
export const START_REFETCH_PERIOD = 20;
export const LIMIT_REFETCH_PERIOD = 40;
/**
 * Refreshes the status of proposals based on the current timestamp.
 * @remarks This function moves proposals from discussion to votingStatus status
 * and from votingStatus to accepted or rejected status.
 */
export function _autoRefreshCall(): void {
    _assertAutoRefreshStatus();
    _refresh();
    Storage.set(LAST_REFETCH_PERIOD_TAG, u64ToBytes(Context.currentPeriod()));

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

    if (
        votingStatusProposalsKeys.length === 0 &&
        discussionStatusProposalsKeys.length === 0
    ) {
        return;
    }

    asyncCall(
        Context.callee(), // target
        'runAutoRefresh', // functionName
        new Slot(validityStartPeriod, validityStartThread), // startSlot
        new Slot(validityEndPeriod, validityEndThread), // endSlot
        1_000_000_000, // maxGas
        1_000, // rawFee
    );
    Storage.set(LAST_REFETCH_PERIOD_TAG, u64ToBytes(Context.currentPeriod()));
}

/**
 * Checks if the last refetch period is older than the current period + LIMIT_REFETCH_PERIOD
 * If it is, it calls the runAutoRefresh function
 */
export function _ensureAutoRefresh(): void {
    const currentPeriod = Context.currentPeriod();

    if (!Storage.has(LAST_REFETCH_PERIOD_TAG)) {
        _autoRefreshCall();
        return;
    }

    const lastPeriod = bytesToU64(Storage.get(LAST_REFETCH_PERIOD_TAG));

    // Restart if beyond tolerance window
    if (currentPeriod > lastPeriod + LIMIT_REFETCH_PERIOD + 1) {
        _autoRefreshCall();
    }
}

/**
 * Asserts that the auto refresh status is enabled
 */
export function _assertAutoRefreshStatus(): void {
    if (!Storage.has(AUTO_REFRESH_STATUS_KEY)) {
        Storage.set(AUTO_REFRESH_STATUS_KEY, boolToByte(true));
    }
    const autoRefreshStatus = Storage.get(AUTO_REFRESH_STATUS_KEY);
    assert(autoRefreshStatus, 'Auto refresh is disabled');
}
