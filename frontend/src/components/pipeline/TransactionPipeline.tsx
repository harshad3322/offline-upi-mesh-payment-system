import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

type Props = {
  stage: number;
};

const steps = [
  'Create Payment',
  'Encrypt',
  'Mesh Propagation',
  'Bridge Upload',
  'Idempotency Check',
  'Settlement',
];

export function TransactionPipeline({ stage }: Props) {
  return (
    <SectionCard title="Transaction Pipeline" icon={<Circle className="h-5 w-5" />}>
      <div className="grid gap-3 md:grid-cols-6">
        {steps.map((step, index) => {
          const complete = stage >= index + 1;
          return (
            <motion.div
              key={step}
              animate={{ y: complete ? -2 : 0, opacity: 1 }}
              className={`rounded-2xl border p-4 text-center ${
                complete ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/30">
                {complete ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <span className="text-xs font-semibold text-slate-300">{index + 1}</span>}
              </div>
              <p className={`text-sm font-medium ${complete ? 'text-emerald-200' : 'text-slate-200'}`}>{step}</p>
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
}
