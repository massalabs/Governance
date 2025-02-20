import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

export const contracts = {
  [NetworkName.Mainnet]: {
    masOg: 'XXX',
    oracle: 'AS1OracleAddress',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1D8KuNiSLCJhhy7JQue1ce2o4W3DvvyVn7SwUXA5zjGwVZU12P',
    oracle: 'AS12QM25kAyzWNxKLZteqmZnXTyVqyx59Z4i5XWdPhry2N6w2D7Bd',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
