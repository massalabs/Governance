import { migrateMasOg } from "../masog/migrate";
import { contracts } from "../config";
import { Account, NetworkName, Web3Provider } from "@massalabs/massa-web3";
import { migrateOracle } from "../oracle/migrate";

import dotenv from 'dotenv';
dotenv.config();

const accountBuildnet = await Account.fromEnv('PRIVATE_KEY_BUILDNET');
const accountMainnet = await Account.fromEnv('PRIVATE_KEY_MAINNET');

const providerBuildnet = Web3Provider.buildnet(accountBuildnet);
// const providerMainnet = Web3Provider.mainnet(accountMainnet);
const providerMainnet = Web3Provider.buildnet(accountBuildnet); // For testing on buildnet

await migrateMasOg(
    providerBuildnet,
    providerMainnet,
    contracts[NetworkName.Buildnet].masOg,
    contracts[NetworkName.Mainnet].masOg
);

await migrateOracle(
    providerBuildnet,
    providerMainnet,
    contracts[NetworkName.Buildnet].oracle,
    contracts[NetworkName.Mainnet].oracle
);