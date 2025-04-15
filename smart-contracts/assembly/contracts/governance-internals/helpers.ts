import { Args, bytesToU256, bytesToU64 } from '@massalabs/as-types';
import {
  Address,
  call,
  Constant,
  Context,
  Storage,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { MASOG_KEY } from '../rolls-oracle';
import { u256 } from 'as-bignum/assembly';
const MAS_DECIMAL = u64(9);

/**
 * Retrieves the MASOG balance of the caller.
 * @param address - The address of the caller.
 * @returns The MASOG balance of the caller.
 */
export function getMasogBalance(address: string): u256 {
  return bytesToU256(
    call(
      new Address(Storage.get(MASOG_KEY)),
      'balanceOf',
      new Args().add(address),
      0,
    ),
  );
}

/**
 * Asserts that the caller has enough MASOG balance.
 * @param  balance - The current balance of the caller.
 * @param  amount - The required amount of MASOG.
 */
export function assertSufficientMasogBalance(balance: u256, amount: u256): void {
  assert(
    u256.ge(balance, amount),
    `Insufficient MASOG balance to make a proposal (need ${amount})`,
  );
}

/**
 * Retrieves the total supply of MASOG.
 * @returns The total supply of MASOG.
 */
export function getMasogTotalSupply(): u256 {
  return bytesToU256(
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
