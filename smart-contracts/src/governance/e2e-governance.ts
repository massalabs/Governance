/* eslint-disable no-console */
import {
  Mas,
  SmartContract,
  Operation,
  Provider,
  PublicProvider,
  Args,
} from '@massalabs/massa-web3';
import { getProvider, getScByteCode } from '../utils';
import { Governance } from './wrapper/Governance';

async function deployGovernanceContract(): Promise<string> {
  console.log('Deploying governance contract...');
  const byteCode = getScByteCode('build', 'governance.wasm');
  const provider = await getProvider();

  const contract = await Governance.deploy(provider, byteCode, new Args(), {
    coins: Mas.fromString('1'),
  });

  console.log('Governance contract deployed at:', contract.address);
  return contract.address;
}

async function createProposal(contractAddress: string): Promise<Operation> {
  console.log('Creating a new proposal...');
  const provider = await getProvider();
  const governance = await Governance.local(provider, contractAddress);

  const op = await governance.createProposal(
    'Test Proposal',
    'This is a test proposal description',
    1000n, // Governance power threshold
    { coins: Mas.fromString('0.1') },
  );

  await op.waitSpeculativeExecution();
  const events = await op.getSpeculativeEvents();
  console.log(
    'Proposal created events:',
    events.map((e) => e.data),
  );

  return op;
}

async function voteOnProposal(
  contractAddress: string,
  proposalId: bigint,
): Promise<Operation> {
  console.log('Governance on proposal...');
  const provider = await getProvider();
  const governance = await Governance.local(provider, contractAddress);

  const op = await governance.vote(
    proposalId,
    true, // Vote in favor
    { coins: Mas.fromString('0.1') },
  );

  await op.waitSpeculativeExecution();
  const events = await op.getSpeculativeEvents();
  console.log(
    'Vote cast events:',
    events.map((e) => e.data),
  );

  return op;
}

async function refreshGovernanceState(
  contractAddress: string,
): Promise<Operation> {
  console.log('Refreshing governance state...');
  const provider = await getProvider();
  const governance = await Governance.local(provider, contractAddress);

  const op = await governance.refresh({ coins: Mas.fromString('0.1') });

  await op.waitSpeculativeExecution();
  const events = await op.getSpeculativeEvents();
  console.log(
    'Refresh events:',
    events.map((e) => e.data),
  );

  return op;
}

async function getProposalResults(
  contractAddress: string,
  proposalId: bigint,
): Promise<void> {
  console.log('Getting proposal results...');
  const provider = await getProvider();
  const governance = await Governance.local(provider, contractAddress);

  const result = await governance.getProposalResults(proposalId);
  console.log('Proposal results:', result);
}

async function main() {
  try {
    // 1. Deploy the governance contract
    const contractAddress = await deployGovernanceContract();

    // 2. Create a proposal
    const proposalOp = await createProposal(contractAddress);
    const proposalId = 0n; // Assuming this is the first proposal

    // 3. Vote on the proposal
    await voteOnProposal(contractAddress, proposalId);

    // 4. Refresh the governance state
    await refreshGovernanceState(contractAddress);

    // 5. Get the proposal results
    await getProposalResults(contractAddress, proposalId);

    console.log('Governance system e2e test completed successfully!');
  } catch (error) {
    console.error('Error in governance system e2e test:', error);
  }
}

main();
