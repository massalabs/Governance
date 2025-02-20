/* eslint-disable camelcase */
import {
  Provider,
  PublicProvider,
  MRC20,
  Operation,
  Args,
  Mas,
} from '@massalabs/massa-web3';
import { contracts } from '../../config';

export class MasOg extends MRC20 {
  static mainnet(provider: Provider | PublicProvider): MasOg {
    return new MasOg(provider, contracts.mainnet.masOg);
  }

  static buildnet(provider: Provider | PublicProvider): MasOg {
    return new MasOg(provider, contracts.buildnet.masOg);
  }

  static local(provider: Provider | PublicProvider, address?: string): MasOg {
    return new MasOg(provider, address ? address : contracts.buildnet.masOg);
  }

  async refresh(coins: bigint): Promise<Operation> {
    return this.call('refresh', new Args(), { coins });
  }
}
