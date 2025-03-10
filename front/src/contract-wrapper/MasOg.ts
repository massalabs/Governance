/* eslint-disable camelcase */
import {
  Provider,
  PublicProvider,
  MRC20,
  Operation,
  Args,
  Mas,
} from "@massalabs/massa-web3";
import { getContracts } from "../config";

export class MasOg extends MRC20 {
  static async init(provider: Provider | PublicProvider): Promise<MasOg> {
    return new MasOg(provider, getContracts().masOg);
  }

  static async initPublic(publicProvider: PublicProvider): Promise<MasOg> {
    return new MasOg(publicProvider, getContracts().masOg);
  }

  async refresh(coins: bigint, maxCycles = 0n): Promise<Operation> {
    return this.call("refresh", new Args().addI32(maxCycles), { coins });
  }

  async upgradeSC(bytecode: Uint8Array): Promise<Operation> {
    return this.call("upgradeSC", bytecode, {
      coins: Mas.fromString("1"),
    });
  }
}
