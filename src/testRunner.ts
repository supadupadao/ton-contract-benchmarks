import { Blockchain } from '@ton/sandbox';
import { TestCase } from './tests/base';
import { JettonTransferTest } from './tests/jettonTransfer';
import { JettonMaster, JettonMasterConstructor } from './contracts/base';

export class TestsRunner {
  private contracts: JettonMasterConstructor[] = [];
  private tests: (new (blockchain: Blockchain, contract: JettonMaster) => TestCase)[] = [
    JettonTransferTest,
  ];

  public async registerToken(jettonMaster: JettonMasterConstructor) {
    console.debug('Pushing new token to contracts array', jettonMaster);
    this.contracts.push(jettonMaster);
  }

  async run() {
    for (const jettonMasterConstructor of this.contracts) {
      const blockchain = await Blockchain.create();
      const jettonMaster = await jettonMasterConstructor.create(blockchain);
      for (const Test of this.tests) {
        const testInstance = new Test(blockchain, jettonMaster);
        await testInstance.run();
      }
    }
  }
}
