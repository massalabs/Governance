import { SmartContract, Args, JsonRpcProvider } from "@massalabs/massa-web3";
import { getScByteCode } from "../../utils";
import { deployCoins, networkName } from '../../config';
import { logOperation } from "../../utils/operationLogger";
export async function deployGovernance(masOgAddress: string, provider: JsonRpcProvider): Promise<string> {
    console.log('Deploying governance contract...');

    const byteCode = getScByteCode('build', 'governance.wasm');

    const contract = await SmartContract.deploy(provider, byteCode, new Args().addString(masOgAddress), {
        coins: deployCoins[networkName].governance,
    });

    console.log('Governance contract deployed at:', contract.address);

    const events = await provider.getEvents({
        smartContractAddress: contract.address,
    });

    for (const event of events) {
        console.log('Event message:', event.data);
        if (event.context.origin_operation_id) {
            logOperation('Governance Deployment', event.context.origin_operation_id);
        }
    }

    return contract.address;
}