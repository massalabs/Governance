import { Mas, OperationStatus, StorageCost, Web3Provider } from '@massalabs/massa-web3';
import { calculateStorageCost, getProvider } from '../utils';
import { Oracle } from './wrappers/Oracle';
import { KeyValue } from '../masog/serializable/KeyValue';
import logger from '../utils/logger';

export async function migrateOracle(
    providerBuildnet: Web3Provider,
    providerMainnet: Web3Provider,
    oracleBuildnetAddress: string,
    oracleMainnetAddress: string
): Promise<void> {
    logger.info('*** Migrating Oracle from buildnet to mainnet ***');

    const oracleBuildnet = new Oracle(providerBuildnet, oracleBuildnetAddress);
    const oracleMainnet = new Oracle(providerMainnet, oracleMainnetAddress);

    const keys = await providerBuildnet.getStorageKeys(oracleBuildnet.address);
    const values = await providerBuildnet.readStorage(oracleBuildnet.address, keys);

    logger.info('Total number of keys:', { keysLength: keys.length });
    logger.info('Total number of values:', { valuesLength: values.length });

    // Split into 3 equal parts
    const totalParts = 3;
    const itemsPerPart = Math.ceil(keys.length / totalParts);
    logger.info(`Splitting into ${totalParts} parts, approximately ${itemsPerPart} items per part`);

    for (let partIndex = 0; partIndex < totalParts; partIndex++) {
        const startIndex = partIndex * itemsPerPart;
        const endIndex = Math.min(startIndex + itemsPerPart, keys.length);

        const partKeys = keys.slice(startIndex, endIndex);
        const partValues = values.slice(startIndex, endIndex);

        logger.info(`Processing part ${partIndex + 1}/${totalParts}`);
        logger.info(`Part size: ${partKeys.length} items`);

        const partKeyValues = partKeys.map((key, index) => (
            new KeyValue(key, partValues[index])
        ));

        const partStorageCost = calculateStorageCost(partKeys, partValues);
        logger.info(`Part storage cost: ${partStorageCost} MAS`);

        const op = await oracleMainnet.migrate(partKeyValues, partStorageCost + Mas.fromString('10'));
        const status = await op.waitFinalExecution();

        if (status !== OperationStatus.Success && status !== OperationStatus.SpeculativeSuccess) {
            logger.error('Migration status:', { status: OperationStatus[status] });
            throw new Error(`Failed to migrate part ${partIndex + 1}`);
        }

        logger.info(`Part ${partIndex + 1} migrated successfully`);
    }

    logger.info('*** Verifying migration ***');

    const keys2 = await providerMainnet.getStorageKeys(oracleMainnet.address);
    const values2 = await providerMainnet.readStorage(oracleMainnet.address, keys2);

    logger.info('Original keys length:', { originalKeysLength: keys.length });
    logger.info('Original values length:', { originalValuesLength: values.length });
    logger.info('Migrated keys length:', { migratedKeysLength: keys2.length });
    logger.info('Migrated values length:', { migratedValuesLength: values2.length });

    if (keys.length !== keys2.length || values.length !== values2.length) {
        throw new Error('Key or value length mismatch');
    }

    for (let i = 0; i < keys.length; i++) {
        if (!compareUint8Arrays(keys[i], keys2[i])) {
            logger.error("key mismatch", { key1: keys[i], key2: keys2[i] });
        }
        if (!compareUint8Arrays(values[i], values2[i])) {
            logger.error("value mismatch", { value1: values[i], value2: values2[i] });
        }
    }

    function compareUint8Arrays(a: Uint8Array, b: Uint8Array): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    logger.info('*** Oracle Storage migrated successfully *** \n\n');
}