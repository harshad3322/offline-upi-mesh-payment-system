import { Activity, CircleDollarSign, Clock3, Smartphone } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

type Props = {
  totalTransactions: number;
  totalAmount: number;
  duplicateBlocked: number;
  activeDevices: number;
};

export function KpiRow({ totalTransactions, totalAmount, duplicateBlocked, activeDevices }: Props) {
  const data = [
    {
      label: 'Total Transactions',
      value: totalTransactions,
      delta: 'All visible ledger entries',
      icon: <Activity className="h-5 w-5" />,
      accent: 'blue' as const,
    },
    {
      label: 'Total Amount Settled',
      value:  totalAmount,
      delta: 'Summed from settled transactions',
      icon: <CircleDollarSign className="h-5 w-5" />,
      accent: 'green' as const,
    },
    {
      label: 'Duplicate Packets Blocked',
      value: duplicateBlocked,
      delta: 'Idempotency layer protection',
      icon: <Clock3 className="h-5 w-5" />,
      accent: 'amber' as const,
    },
    {
      label: 'Active Devices',
      value: activeDevices,
      delta: 'Online / bridge nodes',
      icon: <Smartphone className="h-5 w-5" />,
      accent: 'rose' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
