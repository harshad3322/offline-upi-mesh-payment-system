import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Wallet } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

import type { Account } from '@/types';

type Props = {
  accounts: Account[];
};



export function AccountBalanceChart({
  accounts,
}: Props) {
  const data = accounts.map((account) => ({
    name: account.holderName,
    balance: Number(account.balance),
  }));

  return (
    <SectionCard
      title="Account Balances"
      icon={<Wallet />}
    >
      <div className="h-[320px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={data}>
            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="balance"
              fill="#22C55E"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}