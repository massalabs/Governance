import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

const contracts = {
  [NetworkName.Mainnet]: {
    masOg: 'XXX',
    oracle: 'AS1OracleAddress',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'XXX',
    oracle: 'AS1OracleAddress',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
