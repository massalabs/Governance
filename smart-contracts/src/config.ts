import { NetworkName } from '@massalabs/massa-web3';

export const isMainnet = false;

export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: 'AS1OracleAddress',
    masOg: 'XXX',
    governance: 'AS1GovernanceAddress',
  },
  [NetworkName.Buildnet]: {
    masOg: 'AS1GScxLNF9xPk155PbGv6ZD5UT5CSsKZDGBRaRAXTGuZ2nnLn25',
    oracle: 'AS1tZTzx5pnTXDKND3xR1ziFnc27yy2gLLANYUrByUhitWFVgsJ',
    governance: 'AS1GovernanceAddress',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}
