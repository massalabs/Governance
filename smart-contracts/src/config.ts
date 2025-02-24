import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: 'AS1OracleAddress',
    masOg: 'XXX',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1NWxfEPZJsp9x6FiAuDew2Gk2EnZ2eR68Vcn96txXMtrL7fzh3',
    oracle: 'AS18xKXcuUcn7uNNkiFT8rGUpf3c2Si3YXmpNkfTBCXAzvArFGdy',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
