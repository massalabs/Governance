import { u64ToBytes, bytesToU64, boolToByte, stringToBytes } from "@massalabs/as-types";
import { Storage, Context, currentPeriod, getKeys, asyncCall, Slot, generateEvent } from "@massalabs/massa-as-sdk";
import { _refresh } from ".";
import { statusKeyPrefix, votingStatus, discussionStatus } from "./keys";
// Auto refresh constants
export const AUTO_REFRESH_STATUS_KEY = stringToBytes('auto_refresh');
export const LAST_REFETCH_PERIOD_TAG = stringToBytes('last_refetch_timestamp');
export const START_REFETCH_PERIOD = 20;
export const LIMIT_REFETCH_PERIOD = 40;

const MAX_ASYNC_CALL_GAS = 1_000_000_000;
const MAX_ASYNC_CALL_FEE = 1_000;

/**
 * Refreshes the status of proposals based on the current timestamp.
 * @remarks This function moves proposals from discussion to votingStatus status
 * and from votingStatus to accepted or rejected status.
 */
export function _autoRefreshCall(): void {
    _assertAutoRefreshAllowed();
    _refresh();

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

    generateEvent('Voting status proposals keys: ' + votingStatusProposalsKeys.length.toString());
    generateEvent('Discussion status proposals keys: ' + discussionStatusProposalsKeys.length.toString());

    // If no proposals to refresh, we can stop the ASC
    // It will be restarted when a proposal is created
    if (
        votingStatusProposalsKeys.length === 0 &&
        discussionStatusProposalsKeys.length === 0
    ) {
        generateEvent('No proposals to refresh, stopping ASC');
        Storage.set(LAST_REFETCH_PERIOD_TAG, u64ToBytes(0));
        return;
    }

    asyncCall(
        Context.callee(), // target
        'runAutoRefresh', // functionName
        new Slot(validityStartPeriod, validityStartThread), // startSlot
        new Slot(validityEndPeriod, validityEndThread), // endSlot
        MAX_ASYNC_CALL_GAS, // maxGas
        MAX_ASYNC_CALL_FEE, // rawFee
    );

    Storage.set(LAST_REFETCH_PERIOD_TAG, u64ToBytes(Context.currentPeriod()));
}

/**
 * Checks if the last refetch period is older than the current period + LIMIT_REFETCH_PERIOD
 * If it is, it calls the runAutoRefresh function
 */
export function _ensureAutoRefresh(): void {
    const currentPeriod = Context.currentPeriod();


    const lastPeriod = bytesToU64(Storage.get(LAST_REFETCH_PERIOD_TAG));

    // Restart if beyond tolerance window
    if (currentPeriod > lastPeriod + LIMIT_REFETCH_PERIOD + 1) {
        generateEvent('Restarting ASC because of old last refetch period');
        _autoRefreshCall();
    }

    generateEvent('ASC is running or limit period is not reached');
}

/**
 * Asserts that the auto refresh is enabled
 */
export function _assertAutoRefreshAllowed(): void {
    const autoRefreshStatus = Storage.get(AUTO_REFRESH_STATUS_KEY);
    assert(autoRefreshStatus, 'Auto refresh is disabled');
}
