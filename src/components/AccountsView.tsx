import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Landmark, Wallet as WalletIcon, PiggyBank, BarChart3, CreditCard, 
  ArrowLeftRight, ArrowUpRight, ArrowDownRight, ShieldCheck, Lock, 
  Copy, Check, FileText, ChevronRight, Sparkles, TrendingUp, DollarSign, Clock
} from 'lucide-react';
import { UserProfile, Wallet, BankTransaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AccountsViewProps {
  user: UserProfile;
  wallet: Wallet;
  transactions: BankTransaction[];
  onTransfer: (amount: number, from: string, to: string) => void;
  onNavigate: (tab: string) => void;
  isDarkMode: boolean;
}

export default function AccountsView({ 
  user, 
  wallet, 
  transactions, 
  onTransfer,
  onNavigate,
  isDarkMode 
}: AccountsViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFrom, setTransferFrom] = useState<'checking' | 'savings'>('checking');
  const [transferTo, setTransferTo] = useState<'checking' | 'savings'>('savings');
  const [isProcessing, setIsProcessing] = useState(false);

  const masterLedgerBal = wallet.mainBalance;
  const mainBal = wallet.availableBalance;
  const pendingBal = wallet.pendingBalance;
  const savingsBal = wallet.savingsBalance;
  const investmentBal = wallet.investmentBalance || (mainBal * 0.35 + 8500);
  const loanBalance = 12450.00;
  const loanLimit = 35000.00;

  const acctNum = user.accountNumber || '90214820221';
  const routingNum = user.routingNumber || '021000021';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInternalTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (transferFrom === 'checking' && amt > mainBal) {
      alert('Insufficient available funds in Checking account.');
      return;
    }
    if (transferFrom === 'savings' && amt > savingsBal) {
      alert('Insufficient available funds in Savings Vault.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onTransfer(amt, transferFrom, transferTo);
      setTransferAmount('');
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full text-left">
      
      {/* HEADER */}
      <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDarkMode 
          ? 'bg-[#0B1E36] border-blue-900/50 text-white card-glow-dark' 
          : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
      }`}>
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block mb-1">
            Core Banking Accounts
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Accounts & Asset Portfolio</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your depository checking, high-yield compound savings, and credit line obligations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('transfer')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Send Money / Wire</span>
          </button>
        </div>
      </div>

      {/* DETAILED ACCOUNTS CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. CHECKING ACCOUNT */}
        <div className={`p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <WalletIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Commercial Checking</h3>
                  <span className="text-[11px] text-slate-400">Primary Operating Cash</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                ACTIVE
              </span>
            </div>

            <div className="mt-6">
              <span className="text-xs text-slate-400">Available Liquid Balance</span>
              <p className="text-3xl font-extrabold font-sans mt-0.5 text-slate-900 dark:text-white">
                {formatCurrency(mainBal)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-400 font-medium">Master Ledger:</span>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(masterLedgerBal)}
                </span>
                {pendingBal > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-blue-900">•</span>
                    <span className="text-[11px] font-mono text-amber-500">
                      {formatCurrency(pendingBal)} pending
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/40 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans">Account No:</span>
                <div className="flex items-center gap-1.5">
                  <span>•••• {acctNum.slice(-4)}</span>
                  <button 
                    onClick={() => copyToClipboard(acctNum, 'acct')} 
                    className="text-slate-400 hover:text-blue-500"
                  >
                    {copiedField === 'acct' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans">Routing (ABA):</span>
                <div className="flex items-center gap-1.5">
                  <span>{routingNum}</span>
                  <button 
                    onClick={() => copyToClipboard(routingNum, 'routing')} 
                    className="text-slate-400 hover:text-blue-500"
                  >
                    {copiedField === 'routing' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
            <span className="text-emerald-500 font-medium">FDIC Insured $250k</span>
            <button 
              onClick={() => onNavigate('deposit')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Deposit Checks →
            </button>
          </div>
        </div>

        {/* 2. HIGH YIELD SAVINGS VAULT */}
        <div className={`p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">High-Yield Savings</h3>
                  <span className="text-[11px] text-slate-400">Vault & Interest Engine</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500">
                4.85% APY
              </span>
            </div>

            <div className="mt-6">
              <span className="text-xs text-slate-400">Vault Balance</span>
              <p className="text-3xl font-extrabold font-sans mt-0.5 text-slate-900 dark:text-white">
                {formatCurrency(savingsBal)}
              </p>
            </div>

            <div className="mt-6 space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/40 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Interest Frequency:</span>
                <span className="font-semibold text-emerald-500">Monthly Compounding</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Estimated Annual Yield:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  +${((savingsBal * 0.0485)).toFixed(2)}/yr
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Auto-save: Active</span>
            <button 
              onClick={() => onNavigate('goals')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Savings Goals →
            </button>
          </div>
        </div>

        {/* 3. LOANS & CREDIT LINE */}
        <div className={`p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Loan & Line of Credit</h3>
                  <span className="text-[11px] text-slate-400">Fixed Rate Portfolio</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500">
                5.24% APR
              </span>
            </div>

            <div className="mt-6">
              <span className="text-xs text-slate-400">Principal Balance Owed</span>
              <p className="text-3xl font-extrabold font-sans mt-0.5">
                ${loanBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="mt-6 space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/40 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Available Credit:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  ${(loanLimit - loanBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Next Due Date:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Sept 18, 2026 ($385.00)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
            <span className="text-emerald-500 font-medium">Automatic Autopay ON</span>
            <button 
              onClick={() => onNavigate('payments')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Make Payment →
            </button>
          </div>
        </div>
      </div>

      {/* INTERNAL TRANSFERS ACCELERATOR */}
      <div className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border ${
        isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
      }`}>
        <div className="max-w-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block mb-1">
            Instant Allocation
          </span>
          <h3 className="font-bold text-lg">Instant Internal Transfer between Accounts</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Move funds instantly with zero fees between your Checking Account and High-Yield Savings Vault.
          </p>

          <form onSubmit={handleInternalTransfer} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">From Account</label>
                <select
                  value={transferFrom}
                  onChange={(e) => {
                    const from = e.target.value as 'checking' | 'savings';
                    setTransferFrom(from);
                    setTransferTo(from === 'checking' ? 'savings' : 'checking');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A192F] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="checking">Checking (Avail: ${mainBal.toFixed(2)})</option>
                  <option value="savings">Savings Vault (Avail: ${savingsBal.toFixed(2)})</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">To Account</label>
                <select
                  value={transferTo}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-[#0A192F]/60 border border-slate-200 dark:border-blue-900/40 rounded-xl text-xs font-semibold opacity-80 cursor-not-allowed"
                >
                  <option value="savings">Savings Vault (Yield 4.85%)</option>
                  <option value="checking">Checking Account</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Transfer Amount ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-[#0A192F] border border-slate-200 dark:border-blue-900/60 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {isProcessing ? 'Processing Transfer...' : 'Execute Instant Transfer'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
