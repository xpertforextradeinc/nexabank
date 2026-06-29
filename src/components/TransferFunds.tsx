import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { UserProfile, Wallet } from '../types';

interface TransferFundsProps {
  user: UserProfile;
  wallet: Wallet;
  usersList: UserProfile[];
  onTransfer: (recipientId: string, amount: number) => void;
  isDarkMode: boolean;
}

export default function TransferFunds({ user, wallet, usersList, onTransfer, isDarkMode }: TransferFundsProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // List peer recipients (excluding logged in user and admin)
  const peerRecipients = usersList.filter(u => u.id !== user.id && u.role !== 'admin');

  const handleTransferSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);

    if (!recipientEmail) {
      setError('Please select or specify a recipient email.');
      return;
    }

    if (isNaN(amt) || amt <= 1) {
      setError('Minimum transfer limit is $1.00.');
      return;
    }

    if (amt > wallet.availableBalance) {
      setError(`Insufficient available funds. Your current available ledger: $${wallet.availableBalance.toLocaleString()}`);
      return;
    }

    // Safety checks
    if (user.status === 'frozen') {
      setError('Your ledger accounts are currently frozen. Compliance restrictions block outbound transfers.');
      return;
    }
    if (user.status === 'hold') {
      setError('Your account is on administrative hold. No transfers can be executed.');
      return;
    }

    const targetUser = usersList.find(u => u.email.toLowerCase().trim() === recipientEmail.toLowerCase().trim());
    if (!targetUser) {
      setError('The recipient email address does not exist in NexaBank registries.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onTransfer(targetUser.id, amt);
      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative text-left`}>
      
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl z-20 flex flex-col items-center justify-center text-center p-6"
          >
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-display font-semibold text-lg">Instant Transfer Cleared</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5">
              The micro-ledger transactions are resolved in real-time. Destination peer credited successfully. Standard transaction cost: **$0.00**.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl font-sans text-xs font-semibold hover:bg-slate-800 transition"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h3 className="font-display font-bold text-lg">Instant Peer Settlement</h3>
        <p className="text-xs text-slate-500 mt-0.5">Discharge direct peer-to-peer ledger payments on internal Nexa networks.</p>
      </div>

      <form onSubmit={handleTransferSubmit} className="flex flex-col gap-6">
        
        {/* Recipient selection list */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-3">
            CHOOSE REGISTERED NEXABANK PEER
          </span>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {peerRecipients.map((peer) => (
              <button
                key={peer.id}
                type="button"
                onClick={() => setRecipientEmail(peer.email)}
                className={`flex flex-col items-center p-3 rounded-2xl border transition min-w-[90px] ${
                  recipientEmail === peer.email
                    ? 'border-indigo-500 bg-indigo-50/10 text-indigo-900 dark:text-indigo-200 font-semibold'
                    : 'border-slate-100 dark:border-zinc-800 hover:border-slate-200 text-slate-600 bg-transparent'
                }`}
                id={`peer-select-${peer.id}`}
              >
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover mb-2 border border-slate-200/50"
                />
                <span className="text-[10px] text-center truncate w-full">{peer.name.split(' ')[0]}</span>
                <span className="text-[8px] text-slate-400 text-center truncate w-full">Verified Peer</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            OR ENTER RECIPIENT EMAIL ADDRESS
          </label>
          <input
            type="email"
            placeholder="peer@nexabank.com"
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
              setError('');
            }}
            className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition"
            id="input-transfer-recipient"
          />
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            SPECIFY TRANSFER AMOUNT
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
            <input
              type="number"
              placeholder="500.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition"
              id="input-transfer-amount"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition font-sans font-semibold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          id="btn-transfer-submit"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resolving Ledger routes...
            </>
          ) : (
            <>
              Execute Real-Time Settlement
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}
