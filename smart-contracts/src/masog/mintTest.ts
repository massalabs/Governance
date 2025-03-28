import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider } from '../utils';
import { MasOg } from './wrapper/MasOg';

const ADDRESSES: string[] = [];

const provider = await getProvider();
const masOg = MasOg.buildnet(provider);

const totalSupply = await masOg.totalSupply();
console.log('Total supply:', totalSupply);

// If you want addresses to collectively own 99% of final supply
const currentSupply = totalSupply;
const desiredFinalPercentage = 1n;
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
  console.log('Balance of address', ADDRESSES[i], ':', balance);
}
