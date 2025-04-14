import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: 'AS12L7sqpiJXWFBZDLMPH3DtGSBX3nPvsb4EctGvWaEygLtyPKFEA',
    masOg: 'AS14QtrEuDfg9iwZFPnGF2FFFfprgA6NyxquD3stimKvK2LZkacV',
    governance: 'AS1psrFyREXZ58E7FsKx9GasrXKzUk9V3QLwifgkW1NX7hxGbYae',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1RBDkKmg4DNxH4niuUZaec7rXe6qcbmZi8UeTFCBYp9zwxmBrF',
    oracle: 'AS1yUyqvqoQhEw1BEm6k2P3gHz1hvr4mLy5BwCujnTdiBNjYLPAs',
    governance: 'AS12k9LK17UVQGp96dPGhKiQ7xWmMihbN81DhagaCrcdgcRNHJQbE',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
