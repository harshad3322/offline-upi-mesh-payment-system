import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type ToastTone =
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

const toneStyles: Record<
  ToastTone,
  string
> = {
  success:
    'border-emerald-500/30 bg-emerald-500/15 text-emerald-50',

  info:
    'border-sky-500/30 bg-sky-500/15 text-sky-50',

  warning:
    'border-amber-500/30 bg-amber-500/15 text-amber-50',

  error:
    'border-rose-500/30 bg-rose-500/15 text-rose-50',
};

const icons: Record<
  ToastTone,
  ReactNode
> = {
  success: (
    <CheckCircle2 className="h-5 w-5" />
  ),

  info: (
    <Info className="h-5 w-5" />
  ),

  warning: (
    <AlertTriangle className="h-5 w-5" />
  ),

  error: (
    <XCircle className="h-5 w-5" />
  ),
};

export function useToast() {
  const [toasts, setToasts] = useState<
    ToastItem[]
  >([]);

  const [counter, setCounter] =
    useState(1);

  const dismiss = useCallback(
    (id: number) => {
      setToasts((curr) =>
        curr.filter((t) => t.id !== id),
      );
    },
    [],
  );

  const push = useCallback(
    (
      tone: ToastTone,
      title: string,
      description?: string,
    ) => {
      const id = counter;

      setCounter((prev) => prev + 1);

      setToasts((curr) =>
        [
          {
            id,
            tone,
            title,
            description,
          },
          ...curr,
        ].slice(0, 5),
      );

      window.setTimeout(() => {
        dismiss(id);
      }, 4000);
    },
    [counter, dismiss],
  );

  const viewport = useMemo(
    () => (
      <div
        className="
          pointer-events-none
          fixed
          right-4
          top-4
          z-50
          flex
          w-[min(92vw,380px)]
          flex-col
          gap-3
        "
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{
                opacity: 0,
                y: -15,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.95,
              }}
              transition={{
                duration: 0.25,
              }}
              className={`
                pointer-events-auto
                rounded-3xl
                border
                px-5
                py-4
                shadow-[0_0_30px_rgba(59,130,246,.15)]
                backdrop-blur-2xl
                ${toneStyles[toast.tone]}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {icons[toast.tone]}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold">
                    {toast.title}
                  </p>

                  {toast.description && (
                    <p className="mt-1 text-sm text-white/70">
                      {toast.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    dismiss(toast.id)
                  }
                  className="
                    rounded-lg
                    p-1
                    text-white/60
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ),
    [dismiss, toasts],
  );

  return {
    push,
    viewport,
  };
}