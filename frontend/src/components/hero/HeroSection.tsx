import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Wifi,
  Network,
  Fingerprint,
} from 'lucide-react';

import { StatCard } from '@/components/ui/StatCard';

type Props = {
  kpis: Array<{
    label: string;
    value: number;
    icon: ReactNode;
    accent?: 'blue' | 'green' | 'amber' | 'rose';
  }>;
};

export function HeroSection({ kpis }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl md:p-8">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,.12),transparent_24%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        {/* Left Side */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200"
          >
            <Network className="h-3.5 w-3.5" />
            Offline UPI Mesh Network
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl"
          >
            Send payments without internet using encrypted mesh networking and
            bridge nodes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base"
          >
            A portfolio-grade fintech dashboard that visualizes payment creation,
            gossip propagation, bridge uploads, idempotency protection, and
            settlement in one polished interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300"
          >
            {[
              {
                icon: <ShieldCheck className="h-4 w-4" />,
                text: 'Idempotency Protected',
              },
              {
                icon: <Wifi className="h-4 w-4" />,
                text: 'Offline-First Mesh',
              },
              {
                icon: <Fingerprint className="h-4 w-4" />,
                text: 'Encrypted Packet Flow',
              },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {kpis.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              accent={item.accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}