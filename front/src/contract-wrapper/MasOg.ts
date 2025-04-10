/* eslint-disable camelcase */
import {
  Provider,
  PublicProvider,
  MRC20,
} from "@massalabs/massa-web3";
import { getContracts } from "../config";

export class MasOg extends MRC20 {
  static async init(provider: Provider | PublicProvider): Promise<MasOg> {
    return new MasOg(provider, getContracts().masOg);
  }

  static async initPublic(publicProvider: PublicProvider): Promise<MasOg> {
    return new MasOg(publicProvider, getContracts().masOg);
  }
}
