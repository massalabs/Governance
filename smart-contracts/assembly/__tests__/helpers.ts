import { changeCallStack } from '@massalabs/massa-as-sdk';

export function setCallStack(user: string, contract: string): void {
  changeCallStack(user + ' , ' + contract);
}
