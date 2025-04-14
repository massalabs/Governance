import { Mas, OperationStatus, Web3Provider } from '@massalabs/massa-web3';
import { calculateStorageCost, compareUint8Arrays, getProvider } from '../utils';
import { MasOg } from './wrapper/MasOg';
import { KeyValue } from './serializable/KeyValue';

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

    // Compare adn log the length of the keys and values
    console.log('Keys length:', keys.length);
    console.log('Values length:', values.length);
    console.log('Keys2 length:', keys2.length);
    console.log('Values2 length:', values2.length);

    if (keys.length !== keys2.length || values.length !== values2.length) {
        throw new Error('Key or value length mismatch');
    }

    for (let i = 0; i < keys.length; i++) {
        if (!compareUint8Arrays(keys[i], keys2[i])) {
            console.log("key mismatch", keys[i], keys2[i]);
        }
        if (!compareUint8Arrays(values[i], values2[i])) {
            console.log("value mismatch", values[i], values2[i]);
        }
    }

    console.log('*** MasOg Storage migrated successfully *** \n\n');

}
