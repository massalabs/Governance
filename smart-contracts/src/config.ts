import { Mas, NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;
export const networkName = isMainnet ? NetworkName.Mainnet : NetworkName.Buildnet;

export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: 'AS12LtCB1k3dnRZnUCR8KGXaY2Qpc9sN1aaBiwSrU9w2jfu1MZsr4',
    masOg: 'AS12dwsZrv5dGUcVvKrLuFfrTy39izPf56cZSoBhkYFwd3BUM9tYu',
    governance: 'AS12gXJzJra1kHUXftuBLyPrcfEBTJHz6L2nV5aNMnLmLnyBeJxDC',
  },
  [NetworkName.Buildnet]: {
    // BETA
    // masOg: 'AS1RBDkKmg4DNxH4niuUZaec7rXe6qcbmZi8UeTFCBYp9zwxmBrF',
    // oracle: 'AS1JyoLPg4Dr3RYGjjjS8JRnjpVjS4dHoboBA8vFCAZEFct1ELz5',
    // governance: 'AS12k9LK17UVQGp96dPGhKiQ7xWmMihbN81DhagaCrcdgcRNHJQbE',
    oracle: 'AS1SxFbBMQ76HX5R5m2C2DdeN27nwnhBvKaBp9aW9HEYmD3YBvpj',
    masOg: 'AS1XFQaiw9wrHxizvrLKywKXxtyM9eHmmD2mKzvHXUqB2FCTNQpL',
    governance: 'AS12ijbcmb45T7YtxpgzZKFsW62DXX1rTvTDK6aTLa58g6Qu1u5Tm',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}


export const deployCoins = {
  [NetworkName.Mainnet]: {
    oracle: Mas.fromString('30'),
    masOg: Mas.fromString('1'),
    governance: Mas.fromString('100'),
  },
  [NetworkName.Buildnet]: {
    oracle: Mas.fromString('30'),
    masOg: Mas.fromString('1'),
    governance: Mas.fromString('100'),
  },
};
