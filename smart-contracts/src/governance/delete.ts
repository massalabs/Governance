import { getProvider } from '../utils.js';
import { Governance } from './wrapper/Governance.js';

async function main() {
  try {
    const provider = await getProvider();
    const governance = await Governance.init(provider);

    console.log('Fetching all proposals...');
    const proposals = await governance.getProposals();

    console.log(`Found ${proposals.length} proposals to delete`);
    for (const proposal of proposals) {
      console.log(`Deleting proposal ${proposal.id}...`);
      const op = await governance.deleteProposal(proposal.id);
      await op.waitSpeculativeExecution();
    }

    console.log('Successfully deleted all governance proposals');
  } catch (error) {
    console.error('Error deleting governance data:', error);
    process.exit(1);
  }
}

main();
