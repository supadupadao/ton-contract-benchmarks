import { Blockchain } from '@ton/sandbox';
import { JettonMaster } from '../contracts/base';

export abstract class TestCase {
  protected blockchain: Blockchain;
  protected jettonMaster: JettonMaster;
  public abstract name: string;

  constructor(blockchain: Blockchain, jettonMaster: JettonMaster) {
    this.blockchain = blockchain;
    this.jettonMaster = jettonMaster;
  }

  public async run() {
    await this.setup();
    await this.test();
  }

  protected abstract setup(): Promise<void>;
  protected abstract test(): Promise<void>;
}
