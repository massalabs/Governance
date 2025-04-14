import { SmartContract, Args, Mas, OperationStatus } from "@massalabs/massa-web3";
import { getProvider, getScByteCode } from "../../utils";

export async function deployGovernance(masOgAddress: string): Promise<string> {
    console.log('Deploying governance contract...');

    const byteCode = getScByteCode('build', 'governance.wasm');

    const provider = await getProvider();
    const contract = await SmartContract.deploy(provider, byteCode, new Args().addString(masOgAddress), {
        coins: Mas.fromString('1'),
    });

    console.log('Governance contract deployed at:', contract.address);

    const events = await provider.getEvents({
        smartContractAddress: contract.address,
    });

    for (const event of events) {
        console.log('Event message:', event.data);
    }

    return contract.address;
}