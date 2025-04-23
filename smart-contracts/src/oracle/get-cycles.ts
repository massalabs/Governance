import { Account, NetworkName, Web3Provider } from "@massalabs/massa-web3";
import { contracts } from "../config";
import { getProvider } from "../utils";
import { Oracle } from "./wrapper/Oracle";
import { getStakers } from "./feeder/helpers";


async function main() {
  const accountMainnet = await Account.fromEnv('PRIVATE_KEY_MAINNET');
  const providerMainnet = Web3Provider.mainnet(accountMainnet);

  const provider = await getProvider('PRIVATE_KEY_BUILDNET');
  const oracle = new Oracle(provider, contracts[NetworkName.Buildnet].oracle);
  console.log('oracle', oracle.address);

  const cycles = await oracle.getRecordedCycles();
  console.log(cycles);

  // log the last cycle
  const lastCycle = await oracle.getLastCycle();
  console.log(`Last cycle: ${lastCycle}`);

  // await oracle.getAllStorageKeysAndSaveToFile();

  // const events = await provider.getEvents({
  //     smartContractAddress: contracts[NetworkName.Buildnet].oracle,
  // });


  const nbRecord = await oracle.getNbRecordByCycle(lastCycle);
  console.log(`Number of records: ${nbRecord}`);

  const stakers = await getStakers(providerMainnet);
  // log nb stakers
  console.log(`Number of stakers: ${stakers.length}`);

}

main();

setInterval(main, 10000);