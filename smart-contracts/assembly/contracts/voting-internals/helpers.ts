import { Args, bytesToU64 } from '@massalabs/as-types';
import {
  Address,
  call,
  Constant,
  Context,
  Storage,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { MASOG_KEY } from '../rolls-oracle';

const MASOG_DECIMAL = u64(9);
const MAS_DECIMAL = u64(9);

/**
 * Retrieves the MASOG balance of the caller.
 * @param address - The address of the caller.
 * @returns The MASOG balance of the caller.
 */
export function getMasogBalance(address: Address): u64 {
  return bytesToU64(
    call(
      new Address(Storage.get(MASOG_KEY)),
      'balanceOf',
      new Args().add(address.toString()),
      0,
    ),
  );
}

/**
 * Asserts that the caller has enough MASOG balance.
 * @param  balance - The current balance of the caller.
 * @param  amount - The required amount of MASOG.
 */
export function assertSufficientMasogBalance(balance: u64, amount: u64): void {
  assert(
    balance >= amount,
    `Insufficient MASOG balance to make a proposal (need ${
      amount / 10 ** MASOG_DECIMAL
    })`,
  );
}

/**
 * Retrieves the total supply of MASOG.
 * @returns The total supply of MASOG.
 */
export function getMasogTotalSupply(): u64 {
  return bytesToU64(
    call(new Address(Storage.get(MASOG_KEY)), 'totalSupply', new Args(), 0),
  );
}

/**
 * Validates the transferred MAS and burns the specified amount.
 * @param amount - The amount of MAS to be burned.
 */
export function validateAndBurnMas(amount: u64): void {
  const mas = Context.transferredCoins();
  assert(
    mas >= amount,
    `You need to send ${amount / 10 ** MAS_DECIMAL} MAS to make a proposal`,
  );

  transferCoins(new Address(Constant.BURN_ADDRESS), amount);
}
