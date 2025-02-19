import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

const contracts = {
  [NetworkName.Mainnet]: {
    masOg: 'XXX',
    oracle: 'AS1OracleAddress',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1sDmVVGc6czrPtkD77ADZMRvvPFBzE3BB1wDrD5b8ARWGmNGJR',
    oracle: 'AS12rpGXRsSRf7onfZiKxo15ahKP2HKBDvLb93hs2Xps2o2iAimLm',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
