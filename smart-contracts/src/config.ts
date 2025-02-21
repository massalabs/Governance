import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: 'AS1OracleAddress',
    masOg: 'XXX',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    oracle: 'AS12RmhViZwRGkWTsTKzegDkDogakwoQ5LDPRfFGpTTxTwKjhs7Q6',
    masOg: 'AS1Wcu8aGKaJQkkguq8ZFVrcCKYJdrVhqedkAEqQX9xktM2PXteY',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
