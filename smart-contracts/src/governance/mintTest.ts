import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider } from '../utils';
import { MasOg } from '../masog/wrapper/MasOg';

const ADDRESSES = [
  'AU1xs4LUr2XsFhe4YB756bEB2aG59k2Dy2LzLYgYR8zH4o2ZWv5G', // Kevin
  'AU12wiZMwocjfWZKZhzP2dR86PBXJfGCoKY5wi6q1cSQoquMekvfJ', // Joao
  'AU1bTSHvZG7cdUUu4ScKwQVFum3gB5TDpdi9yMRv2bnedYUyptsa', // Tatiana
  'AU1DjgRMPCfnSvDcY3TXkbSQNDpsLQ3NUfCMrisT7xzwWsSe9V4s', // Daniel
  'AU1qTGByMtnFjzU47fQG6SjAj45o5icS3aonzhj1JD1PnKa1hQ5', // Seb
  'AU1wfDH3BNBiFF9Nwko6g8q5gMzHW8KUHUL2YysxkZKNZHq37AfX', // Damir
];

const NAMES = ['Kevin', 'Joao', 'Tatiana', 'Daniel', 'Seb', 'Damir'];

const provider = await getProvider();
const masOg = MasOg.buildnet(provider);

const totalSupply = await masOg.totalSupply();
console.log('Total supply:', totalSupply);

// If you want addresses to collectively own 99% of final supply
const currentSupply = totalSupply;
const desiredFinalPercentage = 99n;
const numberOfAddresses = BigInt(ADDRESSES.length);

// Calculate total new tokens needed so that minted amount is 99% of final supply
const totalToMint =
  (currentSupply * desiredFinalPercentage) / (100n - desiredFinalPercentage);
// Then divide among addresses
const AMOUNT = totalToMint / numberOfAddresses;
const op = await masOg.mintForTest(ADDRESSES, AMOUNT);

const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to update proposal status');
}

console.log('Proposal status updated');

const newTotalSupply = await masOg.totalSupply();
console.log('New total supply:', newTotalSupply);

for (let i = 0; i < ADDRESSES.length; i++) {
  const balance = await masOg.balanceOf(ADDRESSES[i]);
  console.log('Balance of', NAMES[i], ':', balance);
}
