import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, CheckCircle2, RefreshCw } from 'lucide-react';

interface QuickTransferProps {
  balances: { checking: number; savings: number; investment: number };
  onTransfer: (source: 'checking' | 'savings' | 'investment', amount: number, recipient: string) => void;
}

const RECIPIENTS = [
  { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', role: 'UX Designer' },
  { name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', role: 'Tech Lead' },
  { name: 'Marcus Sterling', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', role: 'Advisor' },
  { name: 'Liam Foster', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', role: 'Support' },
];

export default function QuickTransfer({ balances, onTransfer }: QuickTransferProps) {
  const [selectedRecipient, setSelectedRecipient] = useState(RECIPIENTS[0].name);
  const [sourceAccount, setSourceAccount] = useState<'checking' | 'savings' | 'investment'>('checking');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }

    const availableBalance = balances[sourceAccount];
    if (parsedAmount > availableBalance) {
      setError(`Insufficient funds in ${sourceAccount}. Available: $${availableBalance.toFixed(2)}`);
      return;
    }

    setError('');
    onTransfer(sourceAccount, parsedAmount, selectedRecipient);
    setSuccess(true);
    setAmount('');

    // Clear success screen after 3 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20"
            id="transfer-success-overlay"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full mb-3"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h4 className="font-display font-semibold text-sm text-slate-900">Transfer Initiated</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Funds are already in transit to **{selectedRecipient}**. Standard processing fee: **$0.00**.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            Quick Instant Pay
          </h3>
          <p className="text-xs text-slate-500">Send instant zero-fee transfers to trusted contacts.</p>
        </div>
      </div>

      {/* Recipients Carousel */}
      <div className="mb-5">
        <span className="font-display font-medium text-[11px] uppercase tracking-wider text-slate-400 block mb-2.5">
          Select Recipient
        </span>
        <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
          {RECIPIENTS.map((rec) => (
            <button
              key={rec.name}
              type="button"
              onClick={() => setSelectedRecipient(rec.name)}
              className={`flex flex-col items-center p-2.5 rounded-xl border transition-all min-w-[76px] ${
                selectedRecipient === rec.name
                  ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 shadow-sm'
                  : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
              }`}
              id={`btn-recipient-${rec.name.replace(/\s+/g, '-')}`}
            >
              <img
                src={rec.avatar}
                alt={rec.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover mb-1.5 border border-slate-200/50"
              />
              <span className="text-[10px] font-medium font-sans truncate w-full text-center">
                {rec.name.split(' ')[0]}
              </span>
              <span className="text-[8px] text-slate-400 font-sans truncate w-full text-center">
                {rec.role}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transfer Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3.5">
          {/* Source Selector */}
          <div>
            <span className="font-display font-medium text-[11px] uppercase tracking-wider text-slate-400 block mb-1.5">
              Source Asset Account
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100/50">
              {(['checking', 'savings', 'investment'] as const).map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => {
                    setSourceAccount(acc);
                    setError('');
                  }}
                  className={`py-1.5 rounded-lg text-[10px] font-sans font-semibold capitalize transition-all ${
                    sourceAccount === acc
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  id={`btn-transfer-source-${acc}`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <span className="font-display font-medium text-[11px] uppercase tracking-wider text-slate-400 block mb-1.5">
              Amount to Transfer
            </span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 text-xs">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                id="input-transfer-amount"
              />
            </div>
          </div>
        </div>

        <div>
          {error && (
            <p className="text-[10px] text-rose-500 font-sans mb-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-sans font-medium text-xs rounded-xl transition-all border border-slate-950 flex items-center justify-center gap-2 shadow-sm"
            id="btn-transfer-submit"
          >
            <Send className="w-3.5 h-3.5" />
            Send Instant Payment
          </button>
        </div>
      </form>
    </div>
  );
}
