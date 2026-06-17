import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

type Props = {
  label: string;
  value: number;
  icon: ReactNode;
  accent?: 'blue' | 'green' | 'amber' | 'rose';
};

const accentMap = {
  blue: 'from-sky-500/20 to-cyan-400/10 text-sky-200',
  green: 'from-emerald-500/20 to-lime-400/10 text-emerald-200',
  amber: 'from-amber-500/20 to-yellow-400/10 text-amber-200',
  rose: 'from-rose-500/20 to-pink-400/10 text-rose-200',
};

export function StatCard({
  label,
  value,
  icon,
  accent = 'blue',
}: Props) {
  const isMoney = label.includes('Amount');

  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
      }}
      className={`rounded-3xl border border-white/10 bg-gradient-to-br ${accentMap[accent]} p-5 shadow-xl backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-300">
            {label}
          </p>

          <h3 className="mt-3 text-4xl font-bold">
            <CountUp
              start={0}
              end={value}
              duration={2}
              separator=","
              prefix={isMoney ? '₹' : ''}
            />
          </h3>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}