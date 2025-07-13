import { Address } from '@ton/core';
import { TestCase } from './base';
import { ALICE } from '../contracts/common';
import { makeSnapshotMetric } from '@ton/sandbox';

export class JettonTransferTest extends TestCase {
  public name: string = 'Jetton Transfer Test';

  protected async setup() {
    console.debug('Preparing for test', this.name);

    await this.jettonMaster.deploy(this.blockchain);
    console.log(await this.jettonMaster.getWalletAddress(this.blockchain, ALICE));
    await this.jettonMaster.mint(this.blockchain, ALICE, 100n);
  }

  protected async test() {
    console.debug('Running test', this.name);
    
    makeSnapshotMetric(store)
  }
}
