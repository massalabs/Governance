import { Args, Mas, SmartContract } from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../../utils';

export async function deployMasOg(
  oracleAddress: string,
): Promise<string> {
  console.log('Deploying masOg contract...');

  const byteCode = getScByteCode('build', 'masOg.wasm');

  const provider = await getProvider();
  const contract = await SmartContract.deploy(
    provider,
    byteCode,
    new Args().addString(oracleAddress),
    {
      coins: Mas.fromString('1'),
      fee: Mas.fromString('0.1'),
    },
  );

  console.log('MasOg contract deployed at:', contract.address);

  const events = await provider.getEvents({
    smartContractAddress: contract.address,
  });

  for (const event of events) {
    console.log('Event message:', event.data);
  }
  return contract.address;
}
