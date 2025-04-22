import { NetworkName, Mas } from "@massalabs/massa-web3";
import { contracts } from "../config";
import { getProvider } from "../utils";
import { MasOg } from "./wrapper/MasOg";

const provider = await getProvider('PRIVATE_KEY_MAINNET', true);
const masOg = new MasOg(provider, contracts[NetworkName.Mainnet].masOg);

const amount = Mas.fromString('2000');

masOg.withdrawCoins(amount);
