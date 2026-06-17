import { useMemo } from 'react';
import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/ui/SectionCard';
import type { Account } from '@/types';
import { currency } from '@/lib/format';

type Props = {
  accounts?: Account[];
};

export function AccountsDashboard({ accounts = [] }: Props) {
  const total = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance), 0),
    [accounts],
  );

  return (
    <SectionCard title="Account Dashboard" icon={<Coins className="h-5 w-5" />}>
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {accounts.map((account) => (
            <motion.div
              key={account.vpa}
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm font-medium text-white">{account.holderName}</p>
              <p className="mt-1 text-xs text-slate-400">{account.vpa}</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-emerald-300">
                {currency(account.balance)}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/15 to-emerald-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total visible balances</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{currency(total)}</p>
          <p className="mt-2 text-sm text-slate-300">
            Animated balance cards highlight the live state of accounts participating in the offline mesh.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
