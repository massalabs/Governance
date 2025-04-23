import { Args, JsonRpcProvider, Mas, SmartContract } from '@massalabs/massa-web3';
import { getScByteCode } from '../../utils';
import { deployCoins, networkName } from '../../config';
import { logOperation } from '../../utils/operationLogger';
export async function deployOracle(provider: JsonRpcProvider): Promise<string> {
  console.log('Deploying rolls oracle contract...');

  const byteCode = getScByteCode('build', 'rolls-oracle.wasm');


  const contract = await SmartContract.deploy(provider, byteCode, new Args(), {
    coins: deployCoins[networkName].oracle,
    fee: Mas.fromString('10'),
  });

  console.log('Oracle contract deployed at:', contract.address);

  const events = await provider.getEvents({
    smartContractAddress: contract.address,
  });

  for (const event of events) {
    console.log('Event message:', event.data);
    console.log('Event origin operation id:', event.context.origin_operation_id);
    if (event.context.origin_operation_id) {
      logOperation('Oracle Deployment', event.context.origin_operation_id);
    }
  }

  return contract.address;
}
