import { Cell, ContractABI } from '@ton/core';
import { ContractDatabase } from '@ton/sandbox';

export function getContractDatabase(jettonMasterCode: Cell, jettonWalletCode: Cell) {
  const contractData: Record<string, ContractABI | string> = {
    JettonMaster: getJettonMasterABI(),
    JettonWallet: getJettonWalletABI(),
  };

  const jettonMasterCodeHash = `0x${jettonMasterCode.hash().toString('hex')}`;
  contractData[jettonMasterCodeHash] = 'JettonMaster';

  const jettonWalletCodeHash = `0x${jettonWalletCode.hash().toString('hex')}`;
  contractData[jettonWalletCodeHash] = 'JettonWallet';

  return ContractDatabase.from(contractData);
}

export function getJettonMasterABI(): ContractABI {
  return {
    name: 'JettonMaster',
    types: [],
    receivers: [],
  };
}

export function getJettonWalletABI(): ContractABI {
  return {
    name: 'JettonWallet',
    types: [
      {
        name: 'JettonTransfer',
        header: 0x0f8a7ea5,
        fields: [
          {
            name: 'query_id',
            type: {
              kind: 'simple',
              type: 'uint',
              optional: false,
              format: 64,
            },
          },
          {
            name: 'amount',
            type: {
              kind: 'simple',
              type: 'uint',
              optional: false,
              format: 'coins',
            },
          },
          {
            name: 'destination',
            type: {
              kind: 'simple',
              type: 'address',
              optional: false,
            },
          },
          {
            name: 'response_destination',
            type: {
              kind: 'simple',
              type: 'address',
              optional: false,
            },
          },
          {
            name: 'custom_payload',
            type: {
              kind: 'simple',
              type: 'cell',
              optional: true,
            },
          },
          {
            name: 'forward_ton_amount',
            type: {
              kind: 'simple',
              type: 'uint',
              optional: false,
              format: 'coins',
            },
          },
          {
            name: 'forward_payload',
            type: {
              kind: 'simple',
              type: 'slice',
              optional: false,
              format: 'remainder',
            },
          },
        ],
      },
    ],
    receivers: [
      {
        receiver: 'internal',
        message: {
          kind: 'typed',
          type: 'JettonTransfer',
        },
      },
    ],
  };
}
