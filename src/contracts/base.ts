import {
  Address,
  beginCell,
  Cell,
  contractAddress,
  StateInit,
  toNano,
  TupleBuilder,
  TupleItem,
  TupleReader,
} from '@ton/core';
import { Blockchain, GetMethodResult, internal, SendMessageResult } from '@ton/sandbox';

export type JettonMasterConstructor<T extends JettonMaster = JettonMaster> = {
  create(blockchain: Blockchain): Promise<T>;
};
export const JETTON_NAME: string = 'JETTON_NAME';
export const JETTON_DESCRIPTION: string = 'JETTON_DESCRIPTION';
export const JETTON_SYMBOL: string = 'JTN';

export interface JettonWalletData {
  balance: bigint;
}

export abstract class Contract {
  public abstract code: Cell;
  public abstract data: Cell;

  public get stateInit(): StateInit {
    return {
      code: this.code,
      data: this.data,
    };
  }

  public get address(): Address {
    return contractAddress(0, this.stateInit);
  }

  protected async send(
    blockchain: Blockchain,
    from: Address,
    body: Cell,
    stateInit?: StateInit
  ): Promise<SendMessageResult> {
    const to = this.address;
    const value = toNano('0.1');
    return await blockchain.sendMessage(
      internal({
        from,
        to,
        body,
        value,
        stateInit,
      })
    );
  }

  protected async get(
    blockchain: Blockchain,
    method: string,
    args: TupleItem[] = []
  ): Promise<GetMethodResult> {
    return await blockchain.runGetMethod(this.address, method, args);
  }
}

export abstract class JettonMaster extends Contract {
  public abstract deploy(blockchain: Blockchain): Promise<SendMessageResult>;
  public abstract getWallet(blockchain: Blockchain, owner: Address): Promise<JettonWallet>;

  public abstract mint(
    blockchain: Blockchain,
    receiver: Address,
    jettonAmount: bigint
  ): Promise<SendMessageResult>;

  public async getWalletAddress(blockchain: Blockchain, owner: Address): Promise<Address> {
    const METHOD = 'get_wallet_address';
    console.debug(
      `Executing ${METHOD} get method for contract ${this.address.toString()} for owner ${owner.toString()}`
    );
    const args = new TupleBuilder();
    args.writeAddress(owner);
    const result = await this.get(blockchain, METHOD, args.build());
    const reader = new TupleReader(result.stack);
    return reader.readAddress();
  }
}

export abstract class JettonWallet extends Contract {
  protected makeJettonTransfer(receiver: Address, jettonAmount: bigint): Cell {
    const OPCODE: number = 0x0f8a7ea5;

    return beginCell()
      .storeUint(OPCODE, 32)
      .storeUint(0n, 64)
      .storeCoins(jettonAmount)
      .storeAddress(receiver)
      .storeAddress(receiver)
      .storeMaybeRef(null)
      .storeCoins(0n)
      .storeMaybeRef(null)
      .endCell();
  }

  public async transfer(
    blockchain: Blockchain,
    sender: Address,
    receiver: Address,
    jettonAmount: bigint
  ): Promise<SendMessageResult> {
    console.debug(
      `Executing transfer method for contract ${this.address.toString()} from ${sender.toString()} to ${receiver.toString()} for amount ${jettonAmount.toString()}`
    );
    return await this.send(blockchain, sender, this.makeJettonTransfer(receiver, jettonAmount));
  }

  public async getWalletData(blockchain: Blockchain): Promise<JettonWalletData> {
    const METHOD = 'get_wallet_data';
    console.debug(`Executing ${METHOD} get method for contract ${this.address.toString()}`);
    const args = new TupleBuilder();
    const result = await this.get(blockchain, METHOD, args.build());
    const reader = new TupleReader(result.stack);
    return {
      balance: reader.readBigNumber(),
    };
  }
}
