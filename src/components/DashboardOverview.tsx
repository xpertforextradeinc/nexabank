import { useState, ReactNode } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, PiggyBank, Clock, TrendingUp, TrendingDown, Shield, Award, Sparkles, Check, ChevronRight, ShoppingBag, Coffee, Car, DollarSign, Video, HelpCircle, AlertTriangle 
} from 'lucide-react';
import { UserProfile, Wallet, BankTransaction } from '../types';

interface DashboardOverviewProps {
  user: UserProfile;
  wallet: Wallet;
  transactions: BankTransaction[];
  onNavigate: (tab: string) => void;
  isDarkMode: boolean;
}

const CATEGORY_ICONS: Record<string, ReactNode> = {
  food: <Coffee className="w-4 h-4 text-amber-500" />,
  shopping: <ShoppingBag className="w-4 h-4 text-purple-500" />,
  utilities: <Car className="w-4 h-4 text-blue-500" />,
  salary: <DollarSign className="w-4 h-4 text-emerald-500" />,
  deposit: <ArrowUpRight className="w-4 h-4 text-emerald-500" />,
  withdrawal: <ArrowDownRight className="w-4 h-4 text-rose-500" />,
  transfer: <ArrowUpRight className="w-4 h-4 text-indigo-500" />,
  bonus: <Sparkles className="w-4 h-4 text-yellow-500" />,
  adjustment: <HelpCircle className="w-4 h-4 text-slate-500" />,
};

export default function DashboardOverview({ user, wallet, transactions, onNavigate, isDarkMode }: DashboardOverviewProps) {
  const [activeRange, setActiveRange] = useState<'7d' | '30d'>('7d');

  // Sparkline data generator
  const getLinePoints = () => {
    // Generates a nice curve simulating daily bank balances
    const points = activeRange === '7d' 
      ? [11000, 11500, 11200, 12800, 12200, 13400, wallet.mainBalance]
      : [8500, 9200, 9000, 10200, 9800, 11000, 11500, 11200, 12800, 12200, 13400, wallet.mainBalance];
    
    const width = 500;
    const height = 150;
    const maxVal = Math.max(...points) * 1.05;
    const minVal = Math.min(...points) * 0.95;
    const range = maxVal - minVal;

    return points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 30) - 15;
      return { x, y, val };
    });
  };

  const linePoints = getLinePoints();
  const pathString = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaString = `${pathString} L ${linePoints[linePoints.length - 1].x} 150 L 0 150 Z`;

  // Calculated variables
  const recentTxs = transactions.slice(0, 4);
  const totalInflows = transactions
    .filter((t) => t.type === 'credit' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalOutflows = transactions
    .filter((t) => t.type === 'debit' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Upper Cards: Real-time Balance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Main Balance */}
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative flex flex-col justify-between overflow-hidden`}>
          {user.status === 'frozen' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-rose-500/10 text-rose-500 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-rose-500/20">
              <AlertTriangle className="w-3 h-3 animate-pulse" /> Frozen
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-zinc-950 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Available Balance
              </span>
              <h3 className="font-display font-bold text-sm leading-tight">Primary Cash Wallet</h3>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-3xl font-display font-bold tracking-tight">
              ${wallet.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-slate-400 font-sans">Book Balance:</span>
              <span className="font-mono font-medium">${wallet.mainBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Cleared Vault */}
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative flex flex-col justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-zinc-950 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Pending Funds
              </span>
              <h3 className="font-display font-bold text-sm leading-tight">Awaiting Admin Settlement</h3>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-3xl font-display font-bold tracking-tight">
              ${wallet.pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-slate-400 font-sans">Verification status:</span>
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                Awaiting Clearing
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: High-Yield Interest Vault */}
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative flex flex-col justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-zinc-950 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Savings Interest Vault
              </span>
              <h3 className="font-display font-bold text-sm leading-tight">Auto-Compound (4.85% APY)</h3>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-3xl font-display font-bold tracking-tight">
              ${wallet.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-slate-400 font-sans">Monthly Yield:</span>
              <span className="text-emerald-500 font-semibold font-mono flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +$182.40
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Line graph of Asset growth (7 columns) */}
        <div className={`lg:col-span-8 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} flex flex-col justify-between`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-zinc-850/10 mb-6">
            <div>
              <h3 className="font-display font-semibold text-base">Asset Ledger Velocity</h3>
              <p className="text-xs text-slate-500">Simulated portfolio valuation over designated timelines.</p>
            </div>

            {/* Timelines selection */}
            <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/40 dark:border-zinc-850">
              <button
                onClick={() => setActiveRange('7d')}
                className={`px-3 py-1 rounded-lg font-sans font-medium text-xs transition ${
                  activeRange === '7d' 
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setActiveRange('30d')}
                className={`px-3 py-1 rounded-lg font-sans font-medium text-xs transition ${
                  activeRange === '30d' 
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* SVG Custom Interactive Line Chart */}
          <div className="w-full h-44 relative">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <path d={areaString} fill="url(#chartGradient)" />

              {/* Sparkline Path */}
              <path
                d={pathString}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Intersecting dots */}
              {linePoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill={idx === linePoints.length - 1 ? '#10b981' : isDarkMode ? '#1f2937' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth="2"
                  className="transition duration-300 hover:scale-150 cursor-pointer"
                />
              ))}
            </svg>

            {/* Hover tooltip hint */}
            <div className="absolute bottom-1 right-2 font-mono text-[9px] text-slate-400 uppercase">
              Last price index value updated Live
            </div>
          </div>

          {/* Bottom Financial Summaries */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100/10 text-left">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Total Inflow Activity</span>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold font-display text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+${totalInflows.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Total Outflow Activity</span>
              <div className="flex items-center gap-2 text-slate-500 font-semibold font-display text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>-${totalOutflows.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Recent ledger feeds (4 columns) */}
        <div className={`lg:col-span-4 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} flex flex-col`}>
          <div className="flex justify-between items-center pb-4 border-b border-zinc-850/10 mb-4">
            <div>
              <h3 className="font-display font-semibold text-sm">Recent Ledger</h3>
              <p className="text-[10px] text-slate-500">Instant synchronized records.</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-[11px] font-sans font-semibold text-indigo-500 hover:underline"
            >
              See all
            </button>
          </div>

          {/* Transaction feeds */}
          <div className="flex-1 flex flex-col gap-3 max-h-[290px] overflow-y-auto">
            {recentTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 gap-1.5">
                <Clock className="w-7 h-7 opacity-35" />
                <span className="text-xs font-semibold">No transactions registered yet.</span>
              </div>
            ) : (
              recentTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50/5 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-zinc-950 border border-slate-200/10 rounded-xl">
                      {CATEGORY_ICONS[tx.category] || <HelpCircle className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-semibold leading-tight max-w-[120px] truncate">{tx.description}</h4>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{tx.date.split(' ')[0]}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-mono font-semibold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-500 dark:text-zinc-300'}`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                    <span className="block text-[8px] text-slate-400 capitalize">{tx.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Security Assurance footer bar */}
      <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-900 text-white'} flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 shadow-lg`}>
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-medium text-sm">256-bit Secure Ledger Handshake Protected</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Approved transactions are audited under autonomous smart compliance frameworks.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.isUpgraded && (
            <span className="px-3 py-1 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Award className="w-3 h-3" /> Premium Membership Account
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
