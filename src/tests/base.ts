import { Blockchain } from '@ton/sandbox';

export abstract class TestCase {
  protected blockchain: Blockchain;
  // protected jettonMaster: JettonMaster;
  public abstract name: string;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
  }

  public async run() {
    await this.setup();
    await this.test();
  }

  protected abstract setup(): Promise<void>;
  protected abstract test(): Promise<void>;
}
