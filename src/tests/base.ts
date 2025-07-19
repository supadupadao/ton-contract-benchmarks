import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { JettonMaster, JettonWallet } from '../contracts/base';

export interface TestInitData {
  blockchain: Blockchain;
  jettonMaster: SandboxContract<JettonMaster>;
  deployer: SandboxContract<TreasuryContract>;
  deployerWallet: SandboxContract<JettonWallet>;
  alice: SandboxContract<JettonWallet>;
  bob: SandboxContract<JettonWallet>;
}

export abstract class TestCase {
  protected blockchain: Blockchain;
  protected jettonMaster: SandboxContract<JettonMaster>;
  protected deployer: SandboxContract<TreasuryContract>;
  protected deployerWallet: SandboxContract<JettonWallet>;
  protected alice: SandboxContract<JettonWallet>;
  protected bob: SandboxContract<JettonWallet>;
  public abstract name: string;

  constructor(init: TestInitData) {
    this.blockchain = init.blockchain;
    this.jettonMaster = init.jettonMaster;
    this.deployer = init.deployer;
    this.deployerWallet = init.deployerWallet;
    this.alice = init.alice;
    this.bob = init.bob;
  }

  public async run() {
    await this.setup();
    await this.test();
  }

  protected abstract setup(): Promise<void>;
  protected abstract test(): Promise<void>;
}
