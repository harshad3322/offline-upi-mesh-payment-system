import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, Radio, Shield } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';
import type { MeshState } from '@/types';
import { number } from '@/lib/format';

type Props = {
  state?: MeshState;
  onGossip: () => Promise<void>;
  loading?: boolean;
  packetId?: string | null;
  hopCount?: number;
  ttl?: number;
};

const positions = {
  'phone-alice': { left: '13%', top: '55%' },
  'phone-stranger1': { left: '33%', top: '20%' },
  'phone-stranger2': { left: '57%', top: '25%' },
  'phone-stranger3': { left: '74%', top: '58%' },
  'phone-bridge': { left: '83%', top: '25%' },
};

export function MeshVisualization({ state, onGossip, loading, packetId, hopCount = 1, ttl = 5 }: Props) {
  const devices = state?.devices ?? [];
  const packetShort = useMemo(() => (packetId ? packetId.slice(0, 8) : '—'), [packetId]);
  const [pulse, setPulse] = useState(0);

  return (
    <SectionCard
      title="Mesh Network Visualization"
      icon={<Radio className="h-5 w-5" />}
      action={
        <button
          onClick={async () => {
            setPulse((v) => v + 1);
            await onGossip();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-200 ring-1 ring-sky-400/20 transition hover:bg-sky-500/25"
        >
          <Zap className="h-4 w-4" />
          {loading ? 'Running…' : 'Run Gossip Round'}
        </button>
      }
    >
      <div className="relative h-[440px] overflow-hidden rounded-[24px] border border-white/10 bg-black/25 p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,.12),transparent_45%)]" />
        <div className="absolute inset-0">
          <svg className="h-full w-full">
            <defs>
              <linearGradient id="meshLine" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(148,163,184,.15)" />
                <stop offset="50%" stopColor="rgba(59,130,246,.65)" />
                <stop offset="100%" stopColor="rgba(34,197,94,.45)" />
              </linearGradient>
            </defs>
            <line x1="13%" y1="55%" x2="33%" y2="20%" stroke="url(#meshLine)" strokeOpacity="0.75" strokeWidth="2" />
            <line x1="33%" y1="20%" x2="57%" y2="25%" stroke="url(#meshLine)" strokeOpacity="0.65" strokeWidth="2" />
            <line x1="57%" y1="25%" x2="74%" y2="58%" stroke="url(#meshLine)" strokeOpacity="0.65" strokeWidth="2" />
            <line x1="74%" y1="58%" x2="83%" y2="25%" stroke="url(#meshLine)" strokeOpacity="0.8" strokeWidth="2" />
          </svg>
        </div>

        <AnimatePresence>
          {packetId ? (
            <motion.div
              key={`${packetId}-${pulse}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0.4, 1, 0.55], x: ['13%', '42%', '67%', '83%'], y: ['55%', '24%', '35%', '25%'] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.8, ease: 'easeInOut' }}
              className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_0_8px_rgba(34,211,238,.08),0_0_30px_rgba(34,211,238,.9)]"
            />
          ) : null}
        </AnimatePresence>

        {Object.entries(positions).map(([id, pos]) => {
          const device = devices.find((d) => d.deviceId === id);
          const active = Boolean(device?.hasInternet);
          return (
            <motion.div
              key={id}
              style={pos}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              whileHover={{ scale: 1.04 }}
            >
              <div
                className={`min-w-[160px] rounded-3xl border px-4 py-3 shadow-glow backdrop-blur-xl ${
                  active
                    ? 'border-emerald-400/25 bg-emerald-400/12'
                    : 'border-white/10 bg-slate-900/75'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{label(id)}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      active
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-slate-500/15 text-slate-300'
                    }`}
                  >
                    {active ? '4G' : 'Offline'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{device ? `${number(device.packetCount)} packet(s)` : '—'}</span>
                  <span className="font-mono text-slate-300">{device?.packetIds?.[0]?.slice(0, 8) ?? '—'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Shield className="h-4 w-4 text-sky-300" />
            Packet {packetShort}
          </div>
          <p className="mt-1 text-xs text-slate-400">TTL {ttl} · Hop count {hopCount}</p>
        </div>

        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Idempotency cache</p>
          <p className="mt-1 text-xl font-semibold text-white">{number(state?.idempotencyCacheSize ?? 0)}</p>
        </div>
      </div>
    </SectionCard>
  );
}

function label(id: string) {
  const map: Record<string, string> = {
    'phone-alice': 'Alice Phone',
    'phone-stranger1': 'Stranger 1',
    'phone-stranger2': 'Stranger 2',
    'phone-stranger3': 'Stranger 3',
    'phone-bridge': 'Bridge Node',
  };
  return map[id] ?? id;
}
