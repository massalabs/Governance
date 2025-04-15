import { Mas, NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;
export const networkName = isMainnet ? NetworkName.Mainnet : NetworkName.Buildnet;

export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: 'AS137PELwAS9DsMjee97oNyJ8LRUanVAwsDNKt1STv1jVSFQDGvc',
    masOg: 'AS1D7xTR75N8AwgEmzTcLN6gdun58iA9m3MzypTt8JYrEuG5P2Br',
    governance: 'AS1xmvjYjoCybJgPXhFt6sKhGFJUoUiVKaVi25ADcUGhkxWZAgYJ',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1RBDkKmg4DNxH4niuUZaec7rXe6qcbmZi8UeTFCBYp9zwxmBrF',
    oracle: 'AS1JyoLPg4Dr3RYGjjjS8JRnjpVjS4dHoboBA8vFCAZEFct1ELz5',
    governance: 'AS12okpsKCzC3EEU3YyNxXbbFGV7hS4KAja4bU6fEkS12RfwiJUK5',
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
