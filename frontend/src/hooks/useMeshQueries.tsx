import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Account,
  FlushResponse,
  GossipResponse,
  MeshState,
  SendPacketResponse,
  TransactionRecord,
} from '@/types';

export const queryKeys = {
  meshState: ['mesh-state'] as const,
  accounts: ['accounts'] as const,
  transactions: ['transactions'] as const,
};

export function useMeshState() {
  return useQuery({
    queryKey: queryKeys.meshState,
    queryFn: async () => (await api.get<MeshState>('/api/mesh/state')).data,
    refetchInterval: 3000,
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => (await api.get<Account[]>('/api/accounts')).data,
    refetchInterval: 3000,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: async () => (await api.get<TransactionRecord[]>('/api/transactions')).data,
    refetchInterval: 3000,
  });
}

export type { SendPacketResponse, GossipResponse, FlushResponse };
