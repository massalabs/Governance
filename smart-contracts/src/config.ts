import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

const contracts = {
  [NetworkName.Mainnet]: {
    masOg: 'XXX',
    oracle: 'AS1OracleAddress',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1RfrLb21iqjEZFPJM6muu9UsBW84yeNSCZ44UW1eucdoKXWiKq',
    oracle: 'AS12vRWLkkSvR8pRpvYgYrkGhP6REnumX6cPxTg9VAKEcRbxgma9N',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
