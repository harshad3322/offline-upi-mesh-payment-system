import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { TransactionRecord } from '@/types';
import { currency, timeOnly } from '@/lib/format';

type Props = {
  transactions?: TransactionRecord[];
};

type SortKey = 'id' | 'amount' | 'status' | 'settledAt';

export function TransactionLedger({ transactions = [] }: Props) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('settledAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = transactions.filter((t) => {
      const hay = [
        t.id,
        t.senderVpa,
        t.receiverVpa,
        t.status,
        t.bridgeNodeId,
        t.hopCount,
        t.amount,
      ]
        .join(' ')
        .toLowerCase();
      return !q || hay.includes(q);
    });

    next.sort((a, b) => {
      const get = (tx: TransactionRecord) => {
        switch (sortKey) {
          case 'id':
            return Number(tx.id);
          case 'amount':
            return Number(tx.amount);
          case 'status':
            return String(tx.status);
          case 'settledAt':
          default:
            return new Date(tx.settledAt).getTime();
        }
      };
      const av = get(a);
      const bv = get(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return next;
  }, [query, sortDir, sortKey, transactions]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <SectionCard
      title="Transaction Ledger"
      icon={<ChevronDown className="h-5 w-5" />}
      action={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search transactions…"
              className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {sortDir === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />}
          </button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                {[
                  ['id', 'Transaction ID'],
                  ['senderVpa', 'Sender'],
                  ['receiverVpa', 'Receiver'],
                  ['amount', 'Amount'],
                  ['status', 'Status'],
                  ['bridgeNodeId', 'Bridge Node'],
                  ['hopCount', 'Hop Count'],
                  ['settledAt', 'Settled Time'],
                ].map(([k, label]) => (
                  <th
                    key={k}
                    className="cursor-pointer px-4 py-3 font-medium"
                    onClick={() => {
                      if (k === 'senderVpa' || k === 'receiverVpa' || k === 'bridgeNodeId') return;
                      if (k === 'id' || k === 'amount' || k === 'status' || k === 'settledAt') {
                        if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                        else {
                          setSortKey(k as SortKey);
                          setSortDir('desc');
                        }
                      }
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {current.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-slate-200">{tx.id}</td>
                  <td className="px-4 py-3 text-slate-200">{tx.senderVpa}</td>
                  <td className="px-4 py-3 text-slate-200">{tx.receiverVpa}</td>
                  <td className="px-4 py-3 font-medium text-emerald-300">{currency(tx.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                  <td className="px-4 py-3 text-slate-200">{tx.bridgeNodeId}</td>
                  <td className="px-4 py-3 text-slate-200">{tx.hopCount}</td>
                  <td className="px-4 py-3 text-slate-400">{timeOnly(tx.settledAt)}</td>
                </tr>
              ))}
              {!current.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No transactions match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
        <p>
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition disabled:opacity-40"
          >
            Previous
          </button>
          <span className="min-w-14 text-center text-slate-300">
            {page}/{pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
