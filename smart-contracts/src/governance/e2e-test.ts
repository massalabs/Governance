import {
  bytesToStr,
  // , Mas, strToBytes
} from '@massalabs/massa-web3';
import { Governance } from './wrapper/Governance';
// import { Proposal } from './serializable/Proposal';
// import { Vote } from './serializable/Vote';
import { getProvider } from '../utils';

async function main() {
  try {
    // console.log('Starting Governance E2E test...');

    // 1. Initialize Governance
    console.log('\n1. Initializing Governance...');
    const provider = await getProvider('PRIVATE_KEY_VOTER');
    const governance = await Governance.init(provider);
    console.log('Governance initialized successfully');

    // // 2. Create a test proposal
    // console.log('\n2. Creating test proposal...');
    // const testProposal = Proposal.create(
    //   'Test Proposal',
    //   'https://forum.massa.net/t/test-proposal',
    //   'This is a test proposal description',
    //   'No parameter changes',
    //   'test-owner',
    // );

    // // 3. Submit proposal
    // console.log('\n3. Submitting proposal...');
    // const submitOp = await governance.submitProposal(testProposal, {
    //   coins: Mas.fromString('1001'),
    // });
    // console.log('Proposal submitted, waiting for confirmation...');
    // await submitOp.waitFinalExecution();

    // const counter = await governance.getCounter();
    // console.log('Counter:', counter);

    // // 4. Get all proposals
    // console.log('\n4. Getting all proposals...');
    // const proposals = await governance.getProposals();
    // console.log(`Found ${proposals.length} proposals`);
    // console.log(
    //   'Proposals:',
    //   proposals.map((p) => ({
    //     id: p.id,
    //     title: bytesToStr(p.title),
    //     summary: bytesToStr(p.summary),
    //     forumPostLink: bytesToStr(p.forumPostLink),
    //     parameterChange: bytesToStr(p.parameterChange),
    //     owner: bytesToStr(p.owner),
    //     status: bytesToStr(p.status),
    //     positiveVoteVolume: p.positiveVoteVolume,
    //     negativeVoteVolume: p.negativeVoteVolume,
    //     blankVoteVolume: p.blankVoteVolume,
    //   })),
    // );

    const proposalId = 8n;

    // // // 5. Get specific proposal
    // console.log('\n5. Getting specific proposal...');
    const proposal = await governance.getProposal(proposalId);
    console.log('Proposal details:', {
      id: proposal.id,
      title: bytesToStr(proposal.title),
      summary: bytesToStr(proposal.summary),
      forumPostLink: bytesToStr(proposal.forumPostLink),
      parameterChange: bytesToStr(proposal.parameterChange),
      owner: bytesToStr(proposal.owner),
      status: bytesToStr(proposal.status),
      positiveVoteVolume: proposal.positiveVoteVolume,
      negativeVoteVolume: proposal.negativeVoteVolume,
      blankVoteVolume: proposal.blankVoteVolume,
    });

    // TODO: Uncomment this to test the vote function
    // // 6. Cast a vote
    // console.log('\n6. Casting vote...');
    // const vote = new Vote(8n, 1n, strToBytes('Voting in favor'));
    // console.log(vote.serialize());
    // const voteOp = await governance.vote(vote, {
    //   coins: Mas.fromString('0.1'),
    // });
    // console.log('Vote cast, waiting for confirmation...');
    // await voteOp.waitFinalExecution();

    // // 7. Get votes for address
    // console.log('\n7. Getting votes for address...');
    // const address = 'test-owner';
    // const votes = await governance.getVotes(address);
    // console.log(`Found ${votes.length} votes for ${address}`);
    // console.log(
    //   'Votes:',
    //   votes.map((v) => ({
    //     proposalId: v.proposalId,
    //     vote: v.value,
    //     comment: v.comment,
    //   })),
    // );

    // // 8. Get specific vote
    // console.log('\n8. Getting specific vote...');
    // const specificVote = await governance.getVote(address, proposalId);
    // console.log('Vote details:', {
    //   proposalId: specificVote.proposalId,
    //   vote: specificVote.vote,
    //   comment: specificVote.comment,
    // });

    const providerOwner = await getProvider();
    const governanceOwner = await Governance.init(providerOwner);

    // 11. Delete proposal
    console.log('\n11. Deleting proposal...');
    const deleteOp = await governanceOwner.deleteProposal(proposalId);
    console.log('Delete initiated, waiting for confirmation...');
    await deleteOp.waitSpeculativeExecution();

    // Verify deletion
    try {
      await governanceOwner.getProposal(proposalId);
      console.log('Warning: Proposal still exists after deletion');
    } catch (error) {
      console.log('Proposal successfully deleted');
    }

    // console.log('\nGovernance E2E test completed successfully!');
  } catch (error) {
    console.error('Error in Governance E2E test:', error);
    process.exit(1);
  }
}

main();
