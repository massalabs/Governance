import {
  Account,
  Mas,
  OperationStatus,
  Web3Provider,
} from '@massalabs/massa-web3';
import { Oracle } from '../wrapper/Oracle';
import * as dotenv from 'dotenv';
import { RollEntry } from '../serializable/RollEntry';
import { getRandomInt } from '../../utils';
dotenv.config();

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);

console.log('Account address: ' + account.address);

const oracle = Oracle.buildnet(provider);
const cycle = 1n;
const rollNb = 50000n;
const averageRollStorageCost = 6250000n;

let rolls = [];
for (let i = 1; i <= rollNb; i++) {
  rolls.push(new RollEntry(`AU${i}ExampleAddress`, 10n + BigInt(i)));
}

const batchSize = 5000;
for (let i = 0; i < rolls.length; i += batchSize) {
  const end = Math.min(i + batchSize, rolls.length);
  const batch = rolls.slice(i, end);

  const opFeed = await oracle.feedCycle(cycle, batch, {
    coins: Mas.fromNanoMas(averageRollStorageCost * BigInt(batchSize)),
  });

  const status = await opFeed.waitSpeculativeExecution();

  if (status === OperationStatus.SpeculativeError) {
    throw new Error('Failed to feed batch');
  }

  console.log('Batch fed successfully');
}

const recordedRolls = await oracle.getNbRecordedRolls(cycle, false);

console.log('Recorded rolls: ' + recordedRolls);

if (recordedRolls !== rolls.length) {
  throw new Error('Recorded rolls do not match');
}

const opDelete = await oracle.deleteCycle(cycle, {
  coins: Mas.fromString('1'),
});

await opDelete.waitSpeculativeExecution();

const recordedRollsAfterDelete = await oracle.getNbRecordedRolls(cycle, false);

console.log('Recorded rolls after delete: ' + recordedRollsAfterDelete);
if (recordedRollsAfterDelete !== 0) {
  throw new Error('Recorded rolls after delete do not match');
}

const rollsFetched = await oracle.getRolls(1n, false);

for (let i = 0; i < 10; i++) {
  const randomIndex = getRandomInt(0, rollsFetched.length - 1);
  const roll = rollsFetched[randomIndex];
  const originalRoll = rolls.find((r) => r.address === roll.address);
  if (!originalRoll || originalRoll.rolls !== roll.rolls) {
    throw new Error('Rolls fetched do not match');
  }
}

console.log('Cycle fed successfully');
