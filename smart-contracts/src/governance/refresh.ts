import { Mas, OperationStatus } from '@massalabs/massa-web3';
import { getProvider } from '../utils';
import { Governance } from './wrapper/Governance';
import { MasOg } from '../masog/wrapper/MasOg';

const provider = await getProvider();

const masOg = MasOg.buildnet(provider);

const balance = await masOg.balanceOf(provider.address);
console.log('MasOg balance:', balance);

const governanceSystem = await Governance.init(provider);

const op = await governanceSystem.refresh({
  coins: Mas.fromMas(10n),
});
const status = await op.waitFinalExecution();

if (status !== OperationStatus.Success) {
  throw new Error('Failed to refresh proposal status');
}

console.log('Proposal status refreshed');
