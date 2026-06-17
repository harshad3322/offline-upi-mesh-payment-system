type Props = {
  status: string;
};

const map: Record<string, string> = {
  SETTLED: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20',
  REJECTED: 'bg-rose-500/15 text-rose-300 ring-rose-500/20',
  DUPLICATE_DROPPED: 'bg-amber-500/15 text-amber-300 ring-amber-500/20',
  INVALID: 'bg-rose-500/15 text-rose-300 ring-rose-500/20',
};

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${
        map[status] ?? 'bg-slate-500/15 text-slate-300 ring-white/10'
      }`}
    >
      {status}
    </span>
  );
}
