import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractABI,
  ContractProvider,
  Sender,
  toNano,
  TupleBuilder,
  TupleReader,
} from '@ton/core';
import { getJettonMasterABI, getJettonWalletABI } from '../abi';
import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';

export type JettonMasterConstructor<T extends JettonMaster = JettonMaster> = {
  create(deployer: SandboxContract<TreasuryContract>): Promise<T>;
};

export interface JettonWalletData {
  balance: bigint;
}

export abstract class JettonMaster implements Contract {
  readonly address: Address;
  readonly init: { code: Cell; data: Cell };
  readonly abi: ContractABI = getJettonMasterABI();

  public constructor(address: Address, init: { code: Cell; data: Cell }) {
    this.address = address;
    this.init = init;
  }

  public abstract sendDeploy(provider: ContractProvider, via: Sender): Promise<void>;

  public abstract sendMint(
    provider: ContractProvider,
    via: Sender,
    amount: bigint,
    address: Address
  ): Promise<void>;

  public abstract wallet(owner: Address): Promise<JettonWallet>;

  protected async send(provider: ContractProvider, via: Sender, body: Cell) {
    await provider.internal(via, {
      value: toNano('0.1'),
      body: body,
    });
  }
}

export abstract class JettonWallet implements Contract {
  readonly address: Address;
  readonly init: { code: Cell; data: Cell };
  readonly abi: ContractABI = getJettonWalletABI();

  public constructor(address: Address, init: { code: Cell; data: Cell }) {
    this.address = address;
    this.init = init;
  }

  public async sendTransfer(
    provider: ContractProvider,
    via: Sender,
    receiver: Address,
    amount: bigint
  ) {
    const OPCODE = 0x0f8a7ea5;

    this.send(
      provider,
      via,
      beginCell()
        .storeUint(OPCODE, 32)
        .storeUint(0n, 64)
        .storeCoins(amount)
        .storeAddress(receiver)
        .storeAddress(receiver)
        .storeMaybeRef(null)
        .storeCoins(0n)
        .storeMaybeRef(null)
        .endCell()
    );
  }

  public async getWalletData(provider: ContractProvider): Promise<JettonWalletData> {
    const METHOD = 'get_wallet_data';
    console.debug(`Executing ${METHOD} get method for contract ${this.address.toString()}`);
    const args = new TupleBuilder();
    const result = await provider.get(METHOD, args.build());
    return {
      balance: result.stack.readBigNumber(),
    };
  }

  protected async send(provider: ContractProvider, via: Sender, body: Cell) {
    await provider.internal(via, {
      value: toNano('0.1'),
      body: body,
    });
  }
}
