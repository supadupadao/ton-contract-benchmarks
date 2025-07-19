import { ALICE } from '../contracts/common';
import { TestCase } from './base';

export class JettonTransferTest extends TestCase {
  public name: string = 'Jetton Transfer Test';

  protected async setup() {
    console.debug('Preparing for test', this.name);

    await this.jettonMaster.sendDeploy(this.deployer.getSender());
    await this.jettonMaster.sendMint(this.deployer.getSender(), 100n, this.deployer.address);
  }

  protected async test() {
    console.debug('Running test', this.name);

    this.deployerWallet.sendTransfer(this.deployer.getSender(), ALICE, 100n);
  }
}
