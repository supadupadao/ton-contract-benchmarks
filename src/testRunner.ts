import {
  Blockchain,
  ContractDatabase,
  createMetricStore,
  defaultColor,
  gasReportTable,
  makeGasReport,
  makeSnapshotMetric,
  SandboxContract,
  SnapshotMetric,
  TreasuryContract,
} from '@ton/sandbox';
import { TestCase, TestInitData } from './tests/base';
import { JettonTransferTest } from './tests/jettonTransfer';
import { JettonMaster, JettonMasterConstructor } from './contracts/base';
import { ALICE, BOB } from './contracts/common';
import { ContractABI } from '@ton/core';
import { getJettonMasterABI, getJettonWalletABI } from './abi';

export class TestsRunner {
  private contracts: JettonMasterConstructor[] = [];
  private tests: (new (init: TestInitData) => TestCase)[] = [JettonTransferTest];

  public async registerToken(jettonMaster: JettonMasterConstructor) {
    console.debug('Pushing new token to contracts array', jettonMaster);
    this.contracts.push(jettonMaster);
  }

  async run() {
    for (const jettonMasterConstructor of this.contracts) {
      const blockchain = await Blockchain.create();
      const deployer = await blockchain.treasury('deployer');
      const jettonMaster = blockchain.openContract(await jettonMasterConstructor.create(deployer));
      const deployerWallet = blockchain.openContract(await jettonMaster.wallet(deployer.address));
      const alice = blockchain.openContract(await jettonMaster.wallet(ALICE));
      const bob = blockchain.openContract(await jettonMaster.wallet(BOB));
      for (const Test of this.tests) {
        let store = createMetricStore();
        const list: SnapshotMetric[] = [];
        const data: Record<string, string | ContractABI> = {
          JettonMaster: getJettonMasterABI(),
          JettonWallet: getJettonWalletABI(),
        };
        data[`0x${jettonMaster.init.code.hash().toString('hex')}`] = 'JettonMaster';
        data[`0x${deployerWallet.init.code.hash().toString('hex')}`] = 'JettonWallet';
        const contractDatabase = ContractDatabase.from(data);

        const testInstance = new Test({
          blockchain,
          jettonMaster,
          deployer,
          deployerWallet,
          alice,
          bob,
        });

        await testInstance.run();

        const m = makeSnapshotMetric(store, { contractDatabase });
        console.log('METRIC', m);
        list.push(m);

        const delta = makeGasReport(list);
        // console.log(JSON.stringify(contractDatabase.data, null, 2));
        console.log(list, gasReportTable(delta, defaultColor));
      }
    }
  }
}
