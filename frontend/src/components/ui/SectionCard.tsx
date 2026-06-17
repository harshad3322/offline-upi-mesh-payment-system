import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type Props = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function SectionCard({ title, icon, children, className = '', action }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl md:p-6 ${className}`}
    >
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {icon ? <div className="text-sky-300">{icon}</div> : null}
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}
