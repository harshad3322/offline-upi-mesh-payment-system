import { useMemo, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, Layers3, Sparkles } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { Background } from '@/components/layout/Background';
import { HeroSection } from '@/components/hero/HeroSection';
import { PaymentCreator } from '@/components/payment/PaymentCreator';
import MeshVisualization from './components/network/MeshVisualization';
import { TransactionPipeline } from '@/components/pipeline/TransactionPipeline';
import { AccountsDashboard } from '@/components/accounts/AccountsDashboard';
import { TransactionLedger } from '@/components/ledger/TransactionLedger';
import { ActivityLog, type LogEntry, type LogTone } from '@/components/activity/ActivityLog';
import { useAccounts, useMeshState, useTransactions } from '@/hooks/useMeshQueries';
import { useMeshActions } from '@/hooks/useMeshActions';
import { useToast } from '@/hooks/useToast';
import { SettlementTrend } from '@/components/charts/SettlementTrend';
import { AccountBalanceChart } from '@/components/charts/AccountBalanceChart';


function AppShell() {
  const { data: meshState } = useMeshState();
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { sendPacket, gossip, flush, reset } = useMeshActions();
  const { push, viewport } = useToast();

  const [packetMeta, setPacketMeta] = useState<{ packetId: string | null; ttl: number; hopCount: number }>({
    packetId: null,
    ttl: 5,
    hopCount: 1,
  });
  const [pipelineStage, setPipelineStage] = useState(0);
  const [activity, setActivity] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: now(),
      message: 'System initialized · waiting for mesh packets',
      tone: 'white',
    },
  ]);

  const addLog = (message: string, tone: LogTone = 'white') => {
    setActivity((curr) => [{ id: Date.now() + Math.random(), timestamp: now(), message, tone }, ...curr].slice(0, 120));
  };

  const onSend = async (payload: {
    senderVpa: string;
    receiverVpa: string;
    amount: number;
    pin: string;
    ttl: number;
    startDevice: string;
  }) => {
    setPipelineStage(1);
    const res = await sendPacket.mutateAsync(payload);
    setPacketMeta({ packetId: res.packetId, ttl: res.ttl, hopCount: 1 });
    addLog(`Packet ${res.packetId.slice(0, 8)} encrypted & injected at ${res.injectedAt} (TTL ${res.ttl})`, 'blue');
    addLog(`ciphertext (truncated): ${res.ciphertextPreview}`, 'white');
    push('success', 'Packet injected into mesh', `Packet ${res.packetId.slice(0, 8)} is now propagating.`);
  };

  const onGossip = async () => {
    setPipelineStage((v) => Math.max(v, 3));
    const res = await gossip.mutateAsync();
    addLog(`Gossip round completed · ${res.transfers} transfer(s)`, 'blue');
    addLog(`Device counts: ${JSON.stringify(res.deviceCounts)}`, 'white');
    setPacketMeta((curr) => ({ ...curr, hopCount: curr.hopCount + 1 }));
    push('info', 'Mesh gossip completed', `${res.transfers} packet transfer(s) observed.`);
  };

  const onFlush = async () => {
    setPipelineStage(5);
    const res = await flush.mutateAsync();
    addLog(`Bridge flush attempted · ${res.uploadsAttempted} bridge upload(s)`, 'blue');
    res.results.forEach((item) => {
      const tone = item.outcome === 'SETTLED' ? 'green' : item.outcome === 'DUPLICATE_DROPPED' ? 'yellow' : 'red';
      addLog(`bridge ${item.bridgeNode} packet ${item.packetId} → ${item.outcome}${item.reason ? ` (${item.reason})` : ''}`, tone);
    });
    setPipelineStage(6);
    push('success', 'Bridge flush complete', `${res.results.length} result(s) returned.`);
  };

  const onReset = async () => {
    setPipelineStage(0);
    setPacketMeta({ packetId: null, ttl: 5, hopCount: 1 });
    await reset.mutateAsync();
    addLog('Mesh + idempotency cache cleared', 'yellow');
    push('warning', 'Mesh reset', 'Network and cache state were cleared.');
  };

  const totalSettled = useMemo(
    () =>
      (transactions ?? [])
        .filter((t) => t.status === 'SETTLED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions],
  );

  const duplicateBlocked = useMemo(
    () => (transactions ?? []).filter((t) => t.status === 'DUPLICATE_DROPPED').length,
    [transactions],
  );

  const activeDevices = useMemo(
    () => (meshState?.devices ?? []).filter((d) => d.hasInternet).length,
    [meshState],
  );

  const latestState = useMemo(() => {
    return meshState ?? { devices: [], idempotencyCacheSize: 0 };
  }, [meshState]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B1120] text-slate-50">
      <Background />
      {viewport}

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-sm text-sky-200">
              <Sparkles className="h-4 w-4" />
              Fintech-grade offline mesh showcase
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              UPI Offline Mesh — Live Demo
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Demonstrates encrypted packets moving through a Bluetooth-style mesh, bridge upload,
              idempotency protection, and settlement in a premium dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={onFlush} className="btn-primary">
              <ArrowUpRight className="h-4 w-4" />
              Bridge Upload
            </button>
            <button onClick={onReset} className="btn-danger">
              <ShieldCheck className="h-4 w-4" />
              Reset Mesh + Cache
            </button>
          </div>
        </motion.header>

        <HeroSection
  kpis={[
    {
      label: 'Total Transactions',
      value: transactions?.length ?? 0,
      icon: <Layers3 className="h-5 w-5" />,
      accent: 'blue',
    },

    {
      label: 'Total Amount Settled',
      value: totalSettled,
      icon: <ArrowUpRight className="h-5 w-5" />,
      accent: 'green',
    },

    {
      label: 'Duplicate Packets Blocked',
      value: duplicateBlocked,
      icon: <ShieldCheck className="h-5 w-5" />,
      accent: 'amber',
    },

    {
      label: 'Active Devices',
      value: activeDevices,
      icon: <Sparkles className="h-5 w-5" />,
      accent: 'rose',
    },
  ]}
/>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <PaymentCreator onSubmit={onSend} loading={sendPacket.isPending} />
          <MeshVisualization
            state={latestState}
            onGossip={onGossip}
            loading={gossip.isPending}
            packetId={packetMeta.packetId}
            hopCount={packetMeta.hopCount}
            ttl={packetMeta.ttl}
          />
        </div>

        <TransactionPipeline stage={pipelineStage} />

        <AccountsDashboard accounts={accounts ?? []} />

        <div className="grid gap-6 lg:grid-cols-2">
          <SettlementTrend
            transactions={transactions ?? []}
          />

          <AccountBalanceChart
            accounts={accounts ?? []}
          />
        </div>

        <TransactionLedger transactions={transactions ?? []} />

        <ActivityLog entries={activity} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
      <style>{globalStyles}</style>
    </QueryClientProvider>
  );
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const globalStyles = `
  :root { color-scheme: dark; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0B1120; }
  * { box-sizing: border-box; }
  .input {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    padding: 0.85rem 1rem;
    color: #F8FAFC;
    outline: none;
    transition: border-color .2s ease, background .2s ease, transform .2s ease;
  }
  .input:focus {
    border-color: rgba(59,130,246,0.4);
    background: rgba(255,255,255,0.08);
  }
  .btn-primary, .btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 16px;
    padding: 0.8rem 1rem;
    font-weight: 700;
    transition: transform .2s ease, opacity .2s ease, background .2s ease;
  }
  .btn-primary {
    background: linear-gradient(135deg, rgba(59,130,246,1), rgba(37,99,235,1));
    color: white;
    box-shadow: 0 16px 30px rgba(37,99,235,.18);
  }
  .btn-danger {
    background: rgba(239,68,68,.16);
    color: #FEE2E2;
    border: 1px solid rgba(239,68,68,.20);
  }
  .btn-primary:hover, .btn-danger:hover { transform: translateY(-1px); }
`;
