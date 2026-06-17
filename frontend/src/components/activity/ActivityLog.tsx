import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

export type LogTone =
  | 'green'
  | 'blue'
  | 'yellow'
  | 'red'
  | 'white';

export type LogEntry = {
  id: number;
  timestamp: string;
  message: string;
  tone: LogTone;
};

type Props = {
  entries: LogEntry[];
};

const toneMap = {
  green: {
    badge: '[SETTLED]',
    className:
      'bg-emerald-500/20 text-emerald-300',
  },

  blue: {
    badge: '[MESH]',
    className:
      'bg-sky-500/20 text-sky-300',
  },

  yellow: {
    badge: '[DUPLICATE]',
    className:
      'bg-amber-500/20 text-amber-300',
  },

  red: {
    badge: '[ERROR]',
    className:
      'bg-rose-500/20 text-rose-300',
  },

  white: {
    badge: '[INFO]',
    className:
      'bg-slate-500/20 text-slate-300',
  },
};

export function ActivityLog({
  entries,
}: Props) {
  const scrollRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [entries]);

  return (
    <SectionCard
      title="System Activity"
      icon={<Terminal />}
    >
      <div
        ref={scrollRef}
        className="
          h-[420px]
          overflow-y-auto
          rounded-2xl
          bg-black/50
          p-4
          font-mono
          text-sm
        "
      >
        <div className="space-y-2">
          {entries.map((entry) => {
            const style =
              toneMap[entry.tone];

            return (
              <div
                key={entry.id}
                className="
                  flex
                  gap-3
                  rounded-xl
                  border
                  border-white/5
                  p-2
                "
              >
                <span
                  className={`
                    rounded-full
                    px-2
                    py-1
                    text-xs
                    font-semibold
                    ${style.className}
                  `}
                >
                  {style.badge}
                </span>

                <span className="text-slate-500">
                  {entry.timestamp}
                </span>

                <span className="text-slate-200">
                  {entry.message}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}