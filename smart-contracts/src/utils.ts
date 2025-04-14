import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import * as dotenv from 'dotenv';
import { Account, StorageCost, Web3Provider } from '@massalabs/massa-web3';
import { isMainnet } from './config';
dotenv.config();

export function getScByteCode(folderName: string, fileName: string): Buffer {
  // Obtain the current file name and directory paths
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(path.dirname(__filename));
  return readFileSync(path.join(__dirname, folderName, fileName));
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function getProvider(
  envKey = 'PRIVATE_KEY',
  forceMainnet = false,
): Promise<Web3Provider> {
  const account = await Account.fromEnv(envKey);
  return isMainnet || forceMainnet
    ? Web3Provider.mainnet(account)
    : Web3Provider.buildnet(account);
}


export function compareUint8Arrays(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Calculates the storage cost for a given number of key-value pairs.
 * @param keys - The keys to migrate.
 * @param values - The values to migrate.
 * @returns The storage cost in smallest unit.
 */
export function calculateStorageCost(keys: Uint8Array[], values: Uint8Array[]): bigint {
  // Base cost for account
  let totalCost = StorageCost.account();

  // Add cost for each key-value pair
  for (let i = 0; i < keys.length; i++) {
    // Cost for new entry
    totalCost += StorageCost.newEntry();

    // Cost for key bytes
    totalCost += StorageCost.bytes(keys[i].length);

    // Cost for value bytes
    totalCost += StorageCost.bytes(values[i].length);
  }

  // Convert from smallest unit to MAS
  return totalCost;
}