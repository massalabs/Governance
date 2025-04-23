/* eslint-disable camelcase */
import { NetworkName } from "@massalabs/massa-web3";
import chalk from "chalk";
import { CycleInfo } from "./helpers";
import { U64_t } from "@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64";

// Check if output is being piped
const isPiped = !process.stdout.isTTY;

export const log = {
  info: (message: string) => console.log(isPiped ? `ℹ ${message}` : chalk.blue('ℹ') + ' ' + message),
  success: (message: string) => console.log(isPiped ? `✓ ${message}` : chalk.green('✓') + ' ' + message),
  error: (message: string) => console.error(isPiped ? `✗ ${message}` : chalk.red('✗') + ' ' + message),
  warning: (message: string) => console.log(isPiped ? `⚠ ${message}` : chalk.yellow('⚠') + ' ' + message),
  divider: () => console.log(isPiped ? '-'.repeat(80) : chalk.gray('─'.repeat(80))),
};

// Helper function for colored output
export const color = {
  cyan: (text: string) => isPiped ? text : chalk.cyan(text),
  yellow: (text: string) => isPiped ? text : chalk.yellow(text),
  red: (text: string) => isPiped ? text : chalk.red(text),
  gray: (text: string) => isPiped ? text : chalk.gray(text),
};

export function logWithDivider(
  message: string,
  type: 'info' | 'success' | 'error' | 'warning' = 'info',
  error?: Error
) {
  log.divider();
  log[type](message);
  if (error) {
    log.error(`error: ${color.red(error.message)}`);
  }
  log.divider();
}


export function logContarctCycleInfo(networkName: NetworkName, lastCycle: U64_t, recordedCycles: U64_t[]) {
  const cycleInfo = [
    `${color.cyan(`${networkName} Oracle Contract Info:`)}`,
    `  lastCycle in oracle: ${color.yellow(lastCycle.toString())}`,
    `  recordedCycles in oracle: ${color.yellow(recordedCycles.toString())}`,
  ].join('\n');
  log.info(cycleInfo);
}

export function logNetworkCycleInfo(networkName: NetworkName, info: CycleInfo) {
  const cycleInfo = [
    `${color.cyan(`${networkName} Network Info:`)}`,
    `  currentCycle on network: ${color.yellow(info.currentCycle.toString())}`,
    `  currentPeriod on network: ${color.yellow(info.currentPeriod.toString())}`,
    `  remainingPeriods on network: ${color.yellow(info.remainingPeriods.toString())}`,
    `  remainingTimeInMinutes on network: ${color.yellow(info.remainingTimeInMinutes.toString())} min`,
  ].join('\n');
  log.info(cycleInfo);
}
export function logFeederStart(networkName: NetworkName) {
  logWithDivider(`Starting feeder for ${networkName}...`, 'info');
}

export function logFeederEnd(networkName: NetworkName) {
  logWithDivider(`Feeder finished successfully for ${networkName}`, 'success');
}

export function logNoNewCycle(networkName: NetworkName, info: CycleInfo) {
  const message = [
    `No new cycle to process on ${networkName}`,
    `Remaining periods: ${info.remainingPeriods}`,
    `Time left: ${info.remainingTimeInMinutes} minutes`,
  ].join(' ');
  log.warning(message);
}

export function logFeederError(networkName: NetworkName, error: Error) {
  logWithDivider(`Feeder failed for ${networkName}`, 'error', error);
}

export function logSimpleError(message: string) {
  log.error(message);
}
