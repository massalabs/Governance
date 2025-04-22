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
    oracle: 'AS1ZTXJRpnDA2uE27FrjcC8FWWrGcWAZLJFfzxUovyai1WHooAtG',
    masOg: 'AS1XFQaiw9wrHxizvrLKywKXxtyM9eHmmD2mKzvHXUqB2FCTNQpL',
    governance: 'AS12PXh66grB66GQiLasV1nJcGPzTJhCYFaCGuwZQuEHBSePuxjpb',
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
