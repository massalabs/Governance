import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

export const contracts = {
  [NetworkName.Mainnet]: {
    masOg: 'XXX',
    oracle: 'AS1OracleAddress',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1S8ebaNowaFCc4Jv9oTrLfHVhM9raQVhhL4SksC7DqvEC1sUhc',
    oracle: 'AS1HDdfaRP9JAra9h3UeRGeoGmZMCPTf9pUVxdTQrk6nWeKuECzZ',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
