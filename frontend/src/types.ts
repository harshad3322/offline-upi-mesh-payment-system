export type MeshDevice = {
  deviceId: string;
  hasInternet: boolean;
  packetCount: number;
  packetIds: string[];
};

export type MeshState = {
  devices: MeshDevice[];
  idempotencyCacheSize: number;
};

export type Account = {
  vpa: string;
  holderName: string;
  balance: number | string;
};

export type TransactionStatus =
  | 'SETTLED'
  | 'REJECTED'
  | 'DUPLICATE_DROPPED'
  | 'INVALID'
  | string;

export type TransactionRecord = {
  id: number | string;
  senderVpa: string;
  receiverVpa: string;
  amount: number | string;
  status: TransactionStatus;
  bridgeNodeId: string;
  hopCount: number;
  settledAt: string;
};

export type SendPacketResponse = {
  packetId: string;
  injectedAt: string;
  ttl: number;
  ciphertextPreview: string;
};

export type GossipResponse = {
  transfers: number;
  deviceCounts: Record<string, number>;
};

export type FlushResponse = {
  uploadsAttempted: number;
  results: Array<{
    bridgeNode: string;
    packetId: string;
    outcome: string;
    reason?: string;
  }>;
};
