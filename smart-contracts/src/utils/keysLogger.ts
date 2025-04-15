import { bytesToStr } from '@massalabs/massa-web3';
import * as fs from 'fs';
import * as path from 'path';

export function writeKeysToFile(keys: Uint8Array[], filename: string): void {
    const keysAsStrings = keys.map(key => bytesToStr(key));
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, keysAsStrings.join('\n'));
    console.log(`Keys written to ${filePath}`);
} 