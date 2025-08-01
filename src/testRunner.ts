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
import { ContractABI, toNano } from '@ton/core';
import { getJettonMasterABI, getJettonWalletABI } from './abi';
import { appendFile, appendFileSync, writeFileSync } from 'node:fs';

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

      writeFileSync('README.md', '# Benchmarks of TON jetton implementations\n\n');
      appendFileSync(
        'README.md',
        '| Contract Name | Jetton Master gas used | Jetton Wallet gas used |\n'
      );
      appendFileSync(
        'README.md',
        '|---------------|------------------------|------------------------|\n'
      );

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

        await deployerWallet.getWalletData();
        await deployerWallet.sendTransfer(deployer.getSender(), alice.address, 1n);

        const metric = makeSnapshotMetric(store, { contractDatabase });

        const jettonMasterReport = metric.items.reduce((acc, item) => {
          if (item.codeHash == `0x${jettonMaster.init.code.hash().toString('hex')}`) {
            acc += item.execute.compute.gasUsed || 0;
          }
          return acc;
        }, 0);
        const jettonWalletReport = metric.items.reduce((acc, item) => {
          if (item.codeHash == `0x${deployerWallet.init.code.hash().toString('hex')}`) {
            acc += item.execute.compute.gasUsed || 0;
          }
          return acc;
        }, 0);

        appendFileSync(
          'README.md',
          `| ${Test.name} | ${jettonMasterReport} | ${jettonWalletReport} |\n`
        );
      }
    }
  }
}
