import {
  Context,
  generateEvent,
  transferRemaining,
} from '@massalabs/massa-as-sdk';
import { _setOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';

/**
 * Initializes the smart contract and sets the deployer as the owner.
 */
export function constructor(_: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());

  generateEvent('Voting Contract Initialized');
  transferRemaining(Context.transferredCoins());
}
