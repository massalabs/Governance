import { Oracle } from "../oracle/wrappers/Oracle";
import { getProvider } from "../utils";
import { deployGovernance } from "./lib/governance";
import { deployMasOg } from "./lib/masog";
import { deployOracle } from "./lib/oracle";

const provider = await getProvider();

const oracleAddress = await deployOracle();
const masOgAddress = await deployMasOg(oracleAddress);
const governanceAddress = await deployGovernance(masOgAddress);

await new Oracle(provider, oracleAddress).setMasOgAddress(
    masOgAddress,
);

console.log('--------- End of deployment ---------');
console.log('Oracle address:', oracleAddress);
console.log('MasOg address:', masOgAddress);
console.log('Governance address:', governanceAddress);
console.log('-------------------------------------');
