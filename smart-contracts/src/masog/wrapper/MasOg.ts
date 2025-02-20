/* eslint-disable camelcase */
import {
  Provider,
  PublicProvider,
  MRC20,
  Operation,
  Args,
  Mas,
} from '@massalabs/massa-web3';

export const ORACLES_CONTRACTS = {
  mainnet: '',
  buildnet: 'AS1RfrLb21iqjEZFPJM6muu9UsBW84yeNSCZ44UW1eucdoKXWiKq',
  local: '',
};

export class MasOg extends MRC20 {
  static mainnet(provider: Provider | PublicProvider): MasOg {
    return new MasOg(provider, ORACLES_CONTRACTS.mainnet);
  }

  static buildnet(provider: Provider | PublicProvider): MasOg {
    return new MasOg(provider, ORACLES_CONTRACTS.buildnet);
  }

  static local(provider: Provider | PublicProvider, address?: string): MasOg {
    return new MasOg(provider, address ? address : ORACLES_CONTRACTS.local);
  }

  async refresh(coins: bigint): Promise<Operation> {
    return this.call('refresh', new Args(), { coins });
  }
}
