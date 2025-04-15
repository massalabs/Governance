import { Args, JsonRpcProvider, Mas, SmartContract } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../../utils';
import { deployCoins, networkName } from '../../config';
import { logOperation } from '../../utils/operationLogger';
export async function deployMasOg(
  oracleAddress: string,
  provider: JsonRpcProvider,
): Promise<string> {
  console.log('Deploying masOg contract...');

  const byteCode = getScByteCode('build', 'masOg.wasm');

  const contract = await SmartContract.deploy(
    provider,
    byteCode,
    new Args().addString(oracleAddress),
    {
      coins: deployCoins[networkName].masOg,
      fee: Mas.fromString('0.1'),
    },
  );

  console.log('MasOg contract deployed at:', contract.address);

  const events = await provider.getEvents({
    smartContractAddress: contract.address,
  });

  for (const event of events) {
    console.log('Event message:', event.data);
    if (event.context.origin_operation_id) {
      logOperation('MasOg Deployment', event.context.origin_operation_id);
    }
  }
  return contract.address;
}
