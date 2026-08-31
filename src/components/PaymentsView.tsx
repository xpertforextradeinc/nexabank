import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, Calendar, Clock, ArrowUpRight, CheckCircle2, 
  Plus, AlertCircle, ShieldCheck, DollarSign, RefreshCw, Send,
  Building, Zap, Wifi, Home, Landmark
} from 'lucide-react';
import { UserProfile, Wallet, BankTransaction } from '../types';

interface PaymentsViewProps {
  user: UserProfile;
  wallet: Wallet;
  onNavigate: (tab: string) => void;
  isDarkMode: boolean;
}

interface BillItem {
  id: string;
  payee: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'scheduled' | 'paid' | 'autopay';
  icon: any;
}

export default function PaymentsView({ user, wallet, onNavigate, isDarkMode }: PaymentsViewProps) {
  const [bills, setBills] = useState<BillItem[]>([
    { id: 'b-1', payee: 'Metropolitan Power & Gas', category: 'Utilities', amount: 142.50, dueDate: 'Sept 05, 2026', status: 'autopay', icon: Zap },
    { id: 'b-2', payee: 'Verizon Fiber Gigabit', category: 'Internet & Telecom', amount: 89.99, dueDate: 'Sept 10, 2026', status: 'scheduled', icon: Wifi },
    { id: 'b-3', payee: 'First Horizon Mortgage Group', category: 'Housing', amount: 1850.00, dueDate: 'Sept 15, 2026', status: 'autopay', icon: Home },
    { id: 'b-4', payee: 'NexaCard Preferred Rewards', category: 'Credit Card', amount: 425.00, dueDate: 'Sept 18, 2026', status: 'scheduled', icon: CreditCard }
  ]);

  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [successBillId, setSuccessBillId] = useState<string | null>(null);

  const mainBal = wallet.availableBalance;

  const handlePayBill = (bill: BillItem) => {
    if (bill.amount > mainBal) {
      alert('Insufficient checking balance to settle this invoice.');
      return;
    }
    setPayingBillId(bill.id);
    setTimeout(() => {
      setBills(prev => prev.map(b => b.id === bill.id ? { ...b, status: 'paid' } : b));
      setPayingBillId(null);
      setSuccessBillId(bill.id);
      setTimeout(() => setSuccessBillId(null), 3000);
    }, 800);
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
            Bill Pay & Disbursements
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Payments & Scheduled Obligations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage utilities, automated loan payments, vendor invoices, and scheduled wire transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onNavigate('transfer')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED BILLS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Bills List (8 cols) */}
        <div className={`lg:col-span-8 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-blue-900/30 mb-6">
            <div>
              <h3 className="font-bold text-base sm:text-lg">Upcoming Due Invoices</h3>
              <p className="text-xs text-slate-400">Total payable this cycle: <span className="font-mono font-bold text-slate-800 dark:text-white">$2,507.49</span></p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Autopay Active
            </span>
          </div>

          <div className="space-y-3.5">
            {bills.map((bill) => {
              const IconComp = bill.icon;
              const isPaid = bill.status === 'paid';
              const isAutopay = bill.status === 'autopay';

              return (
                <div
                  key={bill.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    isDarkMode 
                      ? 'bg-[#0A192F] border-blue-900/40 hover:border-blue-700/50' 
                      : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">{bill.payee}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{bill.category}</span>
                        <span>•</span>
                        <span className="font-mono">Due {bill.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/50 dark:border-blue-900/30">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-bold font-mono block">
                        ${bill.amount.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                        isPaid ? 'text-emerald-500' : isAutopay ? 'text-blue-400' : 'text-amber-500'
                      }`}>
                        {bill.status}
                      </span>
                    </div>

                    <div>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayBill(bill)}
                          disabled={payingBillId === bill.id}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50"
                        >
                          {payingBillId === bill.id ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Payment Rules & Info (4 cols) */}
        <div className={`lg:col-span-4 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="pb-4 border-b border-slate-100 dark:border-blue-900/30 mb-5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                Security Guarantee
              </span>
              <h3 className="font-bold text-base sm:text-lg">On-Time Payment Assurance</h3>
            </div>

            <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p>NexaBank guarantees all scheduled bill payments will be delivered on or before the due date.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/40 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">Available Liquidity:</span>
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                  ${mainBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-400">Funds are drawn immediately from your Commercial Checking account upon dispatch.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-900/30 text-xs">
            <button 
              onClick={() => onNavigate('deposit')}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#0A192F] hover:bg-slate-200 dark:hover:bg-blue-950 font-semibold text-center transition block"
            >
              Add Funds to Checking →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
