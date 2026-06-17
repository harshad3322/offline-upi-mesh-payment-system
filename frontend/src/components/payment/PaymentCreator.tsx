import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, Shield, Loader2 } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

type Props = {
  onSubmit: (payload: {
    senderVpa: string;
    receiverVpa: string;
    amount: number;
    pin: string;
    ttl: number;
    startDevice: string;
  }) => Promise<void>;
  loading?: boolean;
};

const senderOptions = ['alice@demo', 'bob@demo', 'carol@demo'];
const receiverOptions = ['bob@demo', 'carol@demo', 'alice@demo', 'dave@demo'];

export function PaymentCreator({ onSubmit, loading }: Props) {
  const [sender, setSender] = useState(senderOptions[0]);
  const [receiver, setReceiver] = useState(receiverOptions[0]);
  const [amount, setAmount] = useState(500);
  const [pin, setPin] = useState('1234');

  const canSubmit = useMemo(
    () => sender !== receiver && amount > 0 && pin.length >= 4,
    [sender, receiver, amount, pin],
  );

  return (
    <SectionCard
      title="Payment Creator"
      icon={<Send className="h-5 w-5" />}
      className="h-full"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_0.9fr_auto] lg:items-end">
        <Field label="Sender">
          <select value={sender} onChange={(e) => setSender(e.target.value)} className="input">
            {senderOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>

        <div className="hidden justify-center pb-3 text-slate-400 lg:flex">
          <ArrowRight className="h-4 w-4" />
        </div>

        <Field label="Receiver">
          <select value={receiver} onChange={(e) => setReceiver(e.target.value)} className="input">
            {receiverOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field label="Amount">
          <div className="input flex items-center gap-2">
            <span className="text-slate-400">₹</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-transparent outline-none"
            />
          </div>
        </Field>

        <Field label="PIN">
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            type="password"
            maxLength={4}
            className="input"
          />
        </Field>

        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={!canSubmit || loading}
          onClick={() =>
            onSubmit({
              senderVpa: sender,
              receiverVpa: receiver,
              amount,
              pin,
              ttl: 5,
              startDevice: 'phone-alice',
            })
          }
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-500/20 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          Inject Packet Into Mesh
        </motion.button>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        The backend remains unchanged. This UI only reshapes the existing demo flow into a polished fintech experience.
      </p>
    </SectionCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
