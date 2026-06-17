import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/hooks/useMeshQueries';
import type {
  FlushResponse,
  GossipResponse,
  SendPacketResponse,
} from '@/types';

type SendPacketInput = {
  senderVpa: string;
  receiverVpa: string;
  amount: number;
  pin: string;
  ttl: number;
  startDevice: string;
};

export function useMeshActions() {
  const queryClient = useQueryClient();

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.meshState }),
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
    ]);
  };

  const sendPacket = useMutation({
    mutationFn: async (body: SendPacketInput) =>
      (await api.post<SendPacketResponse>('/api/demo/send', body)).data,
    onSuccess: invalidateAll,
  });

  const gossip = useMutation({
    mutationFn: async () => (await api.post<GossipResponse>('/api/mesh/gossip')).data,
    onSuccess: invalidateAll,
  });

  const flush = useMutation({
    mutationFn: async () => (await api.post<FlushResponse>('/api/mesh/flush')).data,
    onSuccess: invalidateAll,
  });

  const reset = useMutation({
    mutationFn: async () => {
      await api.post('/api/mesh/reset');
    },
    onSuccess: invalidateAll,
  });

  return { sendPacket, gossip, flush, reset };
}
