import { OperationStatus } from '@massalabs/massa-web3';
import { getProvider } from '../utils';
import { MasOg } from './wrapper/MasOg';

const ADDRESSES: string[] = [];

const provider = await getProvider();
const masOg = MasOg.buildnet(provider);

const totalSupply = await masOg.totalSupply();
console.log('Total supply:', totalSupply);

// Calculate how many tokens the addresses currently have
let currentAddressesBalance = 0n;
for (let i = 0; i < ADDRESSES.length; i++) {
  const balance = await masOg.balanceOf(ADDRESSES[i]);
  currentAddressesBalance += balance;
  console.log('Current balance of address', ADDRESSES[i], ':', balance);
}

// Calculate how many tokens are needed to reach 60% of total supply
const desiredPercentage = 70n;
const targetBalance = (totalSupply * desiredPercentage) / 100n;
const additionalTokensNeeded = targetBalance - currentAddressesBalance;

// If we need to mint more tokens
if (additionalTokensNeeded > 0n) {
  const AMOUNT = additionalTokensNeeded / BigInt(ADDRESSES.length);
  console.log('Minting', AMOUNT.toString(), 'tokens to each address');

  const op = await masOg.mintForTest(ADDRESSES, AMOUNT);
  const status = await op.waitFinalExecution();

  if (status !== OperationStatus.Success) {
    throw new Error('Failed to mint tokens');
  }

  console.log('Tokens minted successfully');
} else {
  console.log('No additional tokens needed to reach 60% ownership');
}

// Check final balances
const newTotalSupply = await masOg.totalSupply();
console.log('New total supply:', newTotalSupply);

let finalAddressesBalance = 0n;
for (let i = 0; i < ADDRESSES.length; i++) {
  const balance = await masOg.balanceOf(ADDRESSES[i]);
  finalAddressesBalance += balance;
  console.log('Final balance of address', ADDRESSES[i], ':', balance);
}

console.log('Total balance of all addresses:', finalAddressesBalance);
console.log('Percentage of total supply:', (finalAddressesBalance * 100n) / newTotalSupply, '%');
