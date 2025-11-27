/* eslint-disable camelcase */
import chalk from 'chalk';
import { NetworkName } from '@massalabs/massa-web3';
import { CycleInfo } from './helpers';
import { U64_t } from '@massalabs/massa-web3/dist/esm/basicElements/serializers/number/u64';

// Detect if output is piped (Docker, CI, etc.)
const isPiped = !process.stdout.isTTY;

// Icons (fallback to plain text when piped)
const ICON = {
  INFO: isPiped ? 'ℹ' : chalk.blue('ℹ'),
  SUCCESS: isPiped ? '✓' : chalk.green('✓'),
  ERROR: isPiped ? '✗' : chalk.red('✗'),
  WARN: isPiped ? '⚠' : chalk.yellow('⚠'),
  DIVIDER: isPiped ? '─'.repeat(80) : chalk.gray('─'.repeat(80)),
};

// Simple timestamp prefix (optional, very useful in logs)
const timestamp = () => {
  const now = new Date();
  return isPiped
    ? now.toISOString()
    : chalk.dim(now.toISOString().split('T')[1].replace('Z', ''));
};

// Generic log functions
const info = (msg: string) =>
  console.log(`${timestamp()} ${ICON.INFO}  ${msg}`);
const success = (msg: string) =>
  console.log(`${timestamp()} ${ICON.SUCCESS}  ${msg}`);
const error = (msg: string) =>
  console.error(`${timestamp()} ${ICON.ERROR}  ${msg}`);
const warn = (msg: string) =>
  console.log(`${timestamp()} ${ICON.WARN}  ${msg}`);
const divider = () => console.log(ICON.DIVIDER);

// Fancy boxed message
const box = (
  message: string,
  type: 'info' | 'success' | 'error' | 'warning' = 'info',
) => {
  const colorMap = {
    info: chalk.cyan,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
  };
  const color = isPiped ? (t: string) => t : colorMap[type];

  console.log(ICON.DIVIDER);
  console.log(
    `${timestamp()} ${type === 'error' ? ICON.ERROR : ICON.SUCCESS}  ${color(
      '>>> ' + message + ' <<<',
    )}`,
  );
  console.log(ICON.DIVIDER);
};

// Specific structured logs
export const log = {
  info,
  success,
  error,
  warn,
  divider,
  box,

  // Startup / shutdown
  startFeeder: (network: NetworkName) =>
    box(`Starting feeder for ${chalk.bold(network)}`, 'info'),

  endFeeder: (network: NetworkName) =>
    box(`Feeder finished successfully – ${chalk.bold(network)}`, 'success'),

  noNewCycle: (network: NetworkName, info: CycleInfo) => {
    warn(
      `No new cycle on ${chalk.bold(network)} | ` +
        `Remaining: ${info.remainingPeriods} periods (${info.remainingTimeInMinutes} min)`,
    );
  },

  contractCycleInfo: (
    network: NetworkName,
    lastCycle: U64_t,
    recordedCycles: U64_t[],
  ) => {
    info(
      `${chalk.cyan(`${network} Oracle Contract`)}\n` +
        `   • Last recorded cycle : ${chalk.yellow(lastCycle.toString())}\n` +
        `   • All recorded cycles : ${chalk.yellow(
          recordedCycles.join(', ') || 'none',
        )}`,
    );
  },

  networkCycleInfo: (network: NetworkName, info: CycleInfo) => {
    log.info(
      `${chalk.cyan(`${network} Network`)}\n` +
        `   • Current cycle       : ${chalk.yellow(
          info.currentCycle.toString(),
        )}\n` +
        `   • Current period      : ${chalk.yellow(
          info.currentPeriod.toString(),
        )}\n` +
        `   • Periods remaining   : ${chalk.yellow(
          info.remainingPeriods.toString(),
        )}\n` +
        `   • Time left           : ${chalk.yellow(
          info.remainingTimeInMinutes.toString(),
        )} min`,
    );
  },

  feedingCycle: (network: NetworkName, cycle: U64_t) =>
    info(
      `Feeding rolls for cycle ${chalk.bold(cycle.toString())} on ${chalk.bold(
        network,
      )}`,
    ),

  rollsRecorded: (network: NetworkName, expected: number, recorded: bigint) =>
    recorded === BigInt(expected)
      ? success(`Rolls recorded on ${network} – ${recorded}/${expected}`)
      : error(`Mismatch on ${network}: expected ${expected}, got ${recorded}`),

  deletingCycle: (network: NetworkName, cycle: bigint, count: bigint) =>
    info(`Deleting ${count} records from ${network} – cycle ${cycle}`),

  deletedCycle: (network: NetworkName, cycle: bigint) =>
    success(`Deleted cycle ${cycle} from ${network}`),

  stakerCount: (count: number) =>
    info(
      `Loaded ${chalk.bold(
        count.toString(),
      )} stakers → generating roll entries`,
    ),

  balanceLow: (balance: bigint) =>
    error(`Balance low: ${balance.toString()} MAS (threshold: 1000)`),

  oracleAddress: (network: NetworkName, address: string) =>
    info(`${network} Oracle → ${chalk.magenta(address)}`),
};
