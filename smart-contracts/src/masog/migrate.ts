import { Mas, OperationStatus, Web3Provider } from '@massalabs/massa-web3';
import { calculateStorageCost, compareUint8Arrays } from '../utils';
import { MasOg } from './wrapper/MasOg';
import { KeyValue } from './serializable/KeyValue';
import { logOperation } from '../utils/operationLogger';

export async function migrateMasOg(
    providerBuildnet: Web3Provider,
    providerMainnet: Web3Provider,
    masogBuildnetAddress: string,
    masogMainnetAddress: string
): Promise<void> {
    console.log('*** Migrating MasOg from buildnet to mainnet ***');
    const masOgBuildnet = new MasOg(providerBuildnet, masogBuildnetAddress);
    const masOgMainnet = new MasOg(providerMainnet, masogMainnetAddress);

    const keys = await providerBuildnet.getStorageKeys(masOgBuildnet.address);
    const values = await providerBuildnet.readStorage(masOgBuildnet.address, keys);

    const keyValues = keys.map((key, index) => (
        new KeyValue(key, values[index])
    ));

    const storageCost = calculateStorageCost(keys, values);
    console.log('Estimated storage cost:', storageCost, 'MAS');

    const op = await masOgMainnet.migrate(keyValues, storageCost + Mas.fromString('10'));

    const status = await op.waitFinalExecution();

    if (status !== OperationStatus.Success && status !== OperationStatus.SpeculativeSuccess) {
        // log the status
        console.log('Migration status:', OperationStatus[status]);
        throw new Error('Failed to migrate storage');
    }

    console.log('*** Verifying migration ***');

    const keys2 = await providerMainnet.getStorageKeys(masOgMainnet.address);
    const values2 = await providerMainnet.readStorage(masOgMainnet.address, keys2);


    const keyMismatches: { key1: Uint8Array; key2: Uint8Array }[] = [];
    const valueMismatches: { value1: Uint8Array; value2: Uint8Array }[] = [];

    for (let i = 0; i < keys.length; i++) {
        if (!compareUint8Arrays(keys[i], keys2[i])) {
            keyMismatches.push({ key1: keys[i], key2: keys2[i] });
        }
        if (!compareUint8Arrays(values[i], values2[i])) {
            valueMismatches.push({ value1: values[i], value2: values2[i] });
        }
    }

    // Throw error at the end if there are any mismatches
    if (keys.length !== keys2.length || values.length !== values2.length ||
        keyMismatches.length > 0 || valueMismatches.length > 0) {
        throw new Error('Migration verification failed: Length mismatch or data mismatches found');
    }

    console.log('*** MasOg Storage migrated successfully *** \n\n');

}
