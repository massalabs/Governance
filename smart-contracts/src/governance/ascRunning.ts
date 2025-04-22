import { getCycleInfo } from "../oracle/feeder/helpers";
import { getProvider } from "../utils";
import { Governance } from "./wrapper/Governance";

const provider = await getProvider('PRIVATE_KEY_MAINNET');

const governance = await Governance.init(provider);

const proposalActive = await governance.isProposalActive();

console.log(proposalActive);

const currentPeriod = await getCycleInfo(provider)


const isAscRunning = await governance.isAscRunning(currentPeriod.currentPeriod);

console.log(isAscRunning);