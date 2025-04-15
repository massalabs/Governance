import { isMainnet } from "../config";
import { Oracle } from "../oracle/wrappers/Oracle";
import { getProvider } from "../utils";
import { deployGovernance } from "./lib/governance";
import { deployMasOg } from "./lib/masog";
import { deployOracle } from "./lib/oracle";

const provider = await getProvider(isMainnet ? 'PRIVATE_KEY_MAINNET' : 'PRIVATE_KEY_BUILDNET');

const oracleAddress = await deployOracle(provider);
const masOgAddress = await deployMasOg(oracleAddress, provider);
const governanceAddress = await deployGovernance(masOgAddress, provider);

await new Oracle(provider, oracleAddress).setMasOgAddress(
    masOgAddress,
);

console.log('--------- End of deployment ---------');
console.log('Oracle address:', oracleAddress);
console.log('MasOg address:', masOgAddress);
console.log('Governance address:', governanceAddress);
console.log('-------------------------------------');
