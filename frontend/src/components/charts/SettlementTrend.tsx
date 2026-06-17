import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { TrendingUp } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

import type { TransactionRecord } from '@/types';

type Props = {
  transactions: TransactionRecord[];
};



export function SettlementTrend({
  transactions,
}: Props) {
  const settled = transactions.filter(
    (t) => t.status === 'SETTLED',
  );

  const data = settled.map((tx, index) => ({
    name: `TX ${index + 1}`,
    amount: Number(tx.amount),
  }));

  return (
    <SectionCard
      title="Settlement Trend"
      icon={<TrendingUp />}
    >
      <div className="h-[320px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}