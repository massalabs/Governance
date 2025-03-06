import { OperationStatus, strToBytes } from '@massalabs/massa-web3';
import { getProvider } from '../utils';
import { Proposal } from './serializable/Proposal';
import { Voting } from './wrapper/Voting';
import { MasOg } from '../masog/wrapper/MasOg';

const provider = await getProvider('PRIVATE_KEY_VOTER');

const masOg = MasOg.buildnet(provider);

const balance = await masOg.balanceOf(provider.address);
console.log('MasOg balance:', balance);

const votingSystem = Voting.buildnet(provider);

const proposal = new Proposal(
  strToBytes(
    'https://forum.massalabs.io/t/massa-governance-system-overview/1000',
  ),
  strToBytes('Massa Governance System Overview'),
  strToBytes('This proposal is to overview the Massa Governance System'),
  strToBytes('{"parameter_change": "0"}'),
);

const op = await votingSystem.submitProposal(proposal);
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to submit proposal');
}

console.log('Proposal submitted');
