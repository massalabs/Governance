import { bytesToStr, OperationStatus } from '@massalabs/massa-web3';
import { getProvider } from '../utils';
import { Governance } from './wrapper/Governance';
import { MasOg } from '../masog/wrapper/MasOg';

const STATUS_TO_UPDATE = 0n;

const provider = await getProvider();

const masOg = MasOg.buildnet(provider);

const balance = await masOg.balanceOf(provider.address);
console.log('MasOg balance:', balance);

const governanceSystem = await Governance.init(provider);

const proposals = await governanceSystem.getProposals();

// log all ids
for (const proposal of proposals) {
  console.log('Proposal ID:', proposal.id);
}

let proposal = await governanceSystem.getProposal(STATUS_TO_UPDATE);
console.log('Proposal:', bytesToStr(proposal.status));

const op = await governanceSystem.nextStatus(STATUS_TO_UPDATE);
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to update proposal status');
}

console.log('Proposal status updated');

proposal = await governanceSystem.getProposal(STATUS_TO_UPDATE);
console.log('Proposal:', bytesToStr(proposal.status));
