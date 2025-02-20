import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import * as dotenv from 'dotenv';
import { Account, Web3Provider } from '@massalabs/massa-web3';
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

export async function getProvider(forceMainnet = false): Promise<Web3Provider> {
  const account = await Account.fromEnv();
  return isMainnet || forceMainnet
    ? Web3Provider.mainnet(account)
    : Web3Provider.buildnet(account);
}
