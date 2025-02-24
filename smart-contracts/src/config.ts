import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: 'AS1OracleAddress',
    masOg: 'XXX',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1p7qAM2BMX6FGWqD5ZLA7j2X2UhoT295FKgDgifH43KoF7UufP',
    oracle: 'AS12JmPriXVbL2aaNZ3REPyW5tYuNcoHSe4Pze4DvbG7X1dGmhqPn',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
