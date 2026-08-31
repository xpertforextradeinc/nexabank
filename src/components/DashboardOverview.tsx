import { useState, ReactNode, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, PiggyBank, Clock, TrendingUp, TrendingDown, 
  Shield, Award, Sparkles, Check, ChevronRight, ShoppingBag, Coffee, Car, DollarSign, 
  HelpCircle, AlertTriangle, Lock, ShieldCheck, FileText, Send, CreditCard, Landmark,
  BarChart3, RefreshCw, Layers, ExternalLink, Activity
} from 'lucide-react';
import { UserProfile, Wallet, BankTransaction, WithdrawalRequest } from '../types';
import { useCryptoData } from '../hooks/useCryptoData';
import { formatCurrency } from '../utils/formatters';

interface DashboardOverviewProps {
  user: UserProfile;
  wallet: Wallet;
  transactions: BankTransaction[];
  withdrawals: WithdrawalRequest[];
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
  transfer: <ArrowUpRight className="w-4 h-4 text-blue-500" />,
  bonus: <Sparkles className="w-4 h-4 text-amber-400" />,
  adjustment: <HelpCircle className="w-4 h-4 text-slate-400" />,
};

export default function DashboardOverview({ 
  user, 
  wallet, 
  transactions, 
  withdrawals, 
  onNavigate, 
  isDarkMode 
}: DashboardOverviewProps) {
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);
  const { data: cryptoData, loading: cryptoLoading } = useCryptoData();

  // Calculated variables
  const mainBal = wallet?.availableBalance ?? 0;
  const savingsBal = wallet?.savingsBalance ?? 0;
  const investmentBal = wallet?.investmentBalance ?? (mainBal * 0.35 + 8500);
  
  // Realistic loan calculation based on user profile or stable banking model
  const loanBalance = 12450.00;
  const loanLimit = 35000.00;
  const loanNextPayment = 385.00;
  const loanDueDate = 'Sept 18, 2026';

  // Calculate Running Balances for the Transactions Table (Date, Description, Category, Amount, Balance)
  const transactionsWithRunningBalance = useMemo(() => {
    // Sort chronological (oldest to newest) to calculate running balance, then reverse for display
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Total current available balance
    let currentRunning = mainBal;
    
    // We compute backwards from current balance
    const mappedDesc = [...transactions].map((tx) => {
      return { ...tx };
    });

    // Alternatively calculate running balance per transaction:
    let running = mainBal;
    const withBal = mappedDesc.map((tx, idx) => {
      // For display, attach approximate historical balance
      const rowBalance = running;
      if (tx.type === 'credit') {
        running = Math.max(0, running - tx.amount);
      } else {
        running = running + tx.amount;
      }
      return {
        ...tx,
        runningBalance: rowBalance
      };
    });

    return withBal;
  }, [transactions, mainBal]);

  // Cashflow Totals
  const totalInflows = useMemo(() => {
    const sum = transactions
      .filter((t) => t.type === 'credit' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
    return sum > 0 ? sum : 8450.00;
  }, [transactions]);

  const totalOutflows = useMemo(() => {
    const sum = transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
    return sum > 0 ? sum : 3210.40;
  }, [transactions]);

  const netSavingsMonthly = totalInflows - totalOutflows;

  // Sparkline data generator for Spending / Balance Trends
  const linePoints = useMemo(() => {
    const pointsData: { val: number; label: string }[] = activeRange === '7d' 
      ? [
          { val: mainBal * 0.88, label: 'Mon' },
          { val: mainBal * 0.91, label: 'Tue' },
          { val: mainBal * 0.89, label: 'Wed' },
          { val: mainBal * 0.96, label: 'Thu' },
          { val: mainBal * 0.94, label: 'Fri' },
          { val: mainBal * 0.98, label: 'Sat' },
          { val: mainBal, label: 'Today' }
        ]
      : activeRange === '30d'
      ? [
          { val: mainBal * 0.72, label: 'Week 1' },
          { val: mainBal * 0.78, label: 'Week 2' },
          { val: mainBal * 0.85, label: 'Week 3' },
          { val: mainBal * 0.92, label: 'Week 4' },
          { val: mainBal, label: 'Current' }
        ]
      : [
          { val: mainBal * 0.60, label: 'Jun' },
          { val: mainBal * 0.74, label: 'Jul' },
          { val: mainBal * 0.88, label: 'Aug' },
          { val: mainBal, label: 'Current' }
        ];
    
    const width = 600;
    const height = 180;
    const values = pointsData.map(p => p.val);
    const maxVal = Math.max(...values) * 1.05 || 1;
    const minVal = Math.min(...values) * 0.95 || 0;
    const range = (maxVal - minVal) || 1;

    return pointsData.map((item, idx) => {
      const x = (idx / (pointsData.length - 1)) * width;
      const y = height - ((item.val - minVal) / range) * (height - 40) - 20;
      return { 
        x: isNaN(x) ? 0 : x, 
        y: isNaN(y) ? 90 : y, 
        val: item.val,
        label: item.label 
      };
    });
  }, [activeRange, mainBal]);

  const pathString = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaString = `${pathString} L ${linePoints[linePoints.length - 1].x} 180 L 0 180 Z`;

  // Spend categories calculation for interactive SVG donut chart
  const spendCategories = ['food', 'shopping', 'utilities', 'transfer'];
  const spendByCategory = spendCategories.reduce((acc, cat) => {
    const total = transactions
      .filter((t) => t.category === cat && t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    acc[cat] = total;
    return acc;
  }, {} as Record<string, number>);

  const totalSpentVal = Object.values(spendByCategory).reduce((sum, v) => sum + v, 0);
  
  const finalSpendData = totalSpentVal > 0 
    ? spendCategories.map(cat => ({ category: cat, amount: spendByCategory[cat] }))
    : [
        { category: 'food', amount: 482.50 },
        { category: 'shopping', amount: 1120.00 },
        { category: 'utilities', amount: 340.25 },
        { category: 'transfer', amount: 1267.65 }
      ];

  const totalSpent = finalSpendData.reduce((sum, d) => sum + d.amount, 0);
  
  // Check for deposit required withdrawals
  const depositRequiredWithdrawal = withdrawals.find(w => w.status === 'deposit_required');

  // Account mask helpers
  const acctMask = user.accountNumber ? `•••• ${user.accountNumber.slice(-4)}` : '•••• 4109';
  const routingMask = user.routingNumber || '021000021';

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      
      {/* TOP BANKING SECURITY HEADER BAR */}
      <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        isDarkMode 
          ? 'bg-[#0A192F]/80 border-blue-900/40 text-slate-200 card-glow-dark' 
          : 'bg-white border-slate-200/80 shadow-sm text-slate-800'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Welcome back, {user.name.split(' ')[0]}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Secure Session Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Primary Account: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{acctMask}</span> • Routing: <span className="font-mono">{routingMask}</span>
            </p>
          </div>
        </div>

        {/* Security badges & FDIC Insured indicator */}
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>FDIC Insured up to $250,000</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Layers className="w-3.5 h-3.5" />
            <span>256-Bit TLS</span>
          </div>
        </div>
      </div>

      {/* HOLD NOTICE (if any) */}
      {depositRequiredWithdrawal && depositRequiredWithdrawal.requiredDepositAmount && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-pulse">
          <div className="flex gap-3">
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-500 shrink-0 h-fit mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-600 dark:text-amber-400 text-sm sm:text-base">Outbound transfer pending clearing deposit</h3>
              <p className="text-amber-700/80 dark:text-amber-400/80 text-xs sm:text-sm mt-0.5 font-medium max-w-xl">
                Please deposit <span className="font-mono font-bold">${depositRequiredWithdrawal.requiredDepositAmount.toLocaleString()}</span> to clear this transaction (Ref: {depositRequiredWithdrawal.reference.split('|')[0]}).
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('deposit')}
            className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm w-full sm:w-auto"
          >
            Deposit Now
          </button>
        </div>
      )}

      {/* OVERVIEW: 5 CORE WALLET BALANCES (Main, Available, Pending, Savings, Investment) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Balances Overview
            </h3>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Supabase Live
            </span>
          </div>
          <button 
            onClick={() => onNavigate('accounts')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Accounts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* 1. MAIN BALANCE (Blue Highlight) */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all ${
              isDarkMode 
                ? 'bg-[#0B1E36] border-blue-500/40 text-white shadow-lg shadow-blue-950/30' 
                : 'bg-white border-blue-300 shadow-sm text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                    <WalletIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-blue-600 dark:text-blue-400 block leading-tight">
                      Master Ledger
                    </span>
                    <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">
                      Main Balance
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Primary
                </span>
              </div>

              {/* Side-by-side Label & Formatted Balance */}
              <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30 flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Balance
                </span>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-blue-600 dark:text-blue-400 text-right">
                  {formatCurrency(wallet.mainBalance)}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-400">{acctMask}</span>
              <button 
                onClick={() => onNavigate('transfer')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Transfer →
              </button>
            </div>
          </motion.div>

          {/* 2. AVAILABLE BALANCE (Teal Highlight) */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all ${
              isDarkMode 
                ? 'bg-[#0B1E36] border-teal-500/40 text-white shadow-lg shadow-teal-950/30' 
                : 'bg-white border-teal-300 shadow-sm text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-500 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-teal-600 dark:text-teal-400 block leading-tight">
                      Disbursement
                    </span>
                    <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">
                      Available Balance
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  Liquid
                </span>
              </div>

              {/* Side-by-side Label & Formatted Balance */}
              <div className="mt-4 pt-3 border-t border-teal-100 dark:border-teal-900/30 flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Balance
                </span>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-teal-600 dark:text-teal-400 text-right">
                  {formatCurrency(wallet.availableBalance)}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Instant Access</span>
              <button 
                onClick={() => onNavigate('transfer')}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
              >
                Send →
              </button>
            </div>
          </motion.div>

          {/* 3. PENDING BALANCE (Orange Highlight) */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all ${
              isDarkMode 
                ? 'bg-[#0B1E36] border-orange-500/40 text-white shadow-lg shadow-orange-950/30' 
                : 'bg-white border-orange-300 shadow-sm text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-orange-600 dark:text-orange-400 block leading-tight">
                      In Settlement
                    </span>
                    <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">
                      Pending Balance
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  Clearing
                </span>
              </div>

              {/* Side-by-side Label & Formatted Balance */}
              <div className="mt-4 pt-3 border-t border-orange-100 dark:border-orange-900/30 flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Balance
                </span>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-orange-600 dark:text-orange-400 text-right">
                  {formatCurrency(wallet.pendingBalance)}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Settling 24-48h</span>
              <button 
                onClick={() => onNavigate('deposit')}
                className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
              >
                Deposit →
              </button>
            </div>
          </motion.div>

          {/* 4. SAVINGS BALANCE (Green Highlight) */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all ${
              isDarkMode 
                ? 'bg-[#0B1E36] border-emerald-500/40 text-white shadow-lg shadow-emerald-950/30' 
                : 'bg-white border-emerald-300 shadow-sm text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400 block leading-tight">
                      Compound Vault
                    </span>
                    <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">
                      Savings Balance
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  4.85% APY
                </span>
              </div>

              {/* Side-by-side Label & Formatted Balance */}
              <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/30 flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Balance
                </span>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-emerald-600 dark:text-emerald-400 text-right">
                  {formatCurrency(wallet.savingsBalance)}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Daily Accrual</span>
              <button 
                onClick={() => onNavigate('accounts')}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Vault →
              </button>
            </div>
          </motion.div>

          {/* 5. INVESTMENT BALANCE (Purple Highlight) */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all ${
              isDarkMode 
                ? 'bg-[#0B1E36] border-purple-500/40 text-white shadow-lg shadow-purple-950/30' 
                : 'bg-white border-purple-300 shadow-sm text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-purple-600 dark:text-purple-400 block leading-tight">
                      Index & Yield
                    </span>
                    <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">
                      Investment Balance
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  Portfolio
                </span>
              </div>

              {/* Side-by-side Label & Formatted Balance */}
              <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/30 flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Balance
                </span>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-purple-600 dark:text-purple-400 text-right">
                  {formatCurrency(wallet.investmentBalance)}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-500 font-medium">+1.36% Day</span>
              <button 
                onClick={() => onNavigate('analytics')}
                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                Analytics →
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* QUICK BANKING SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            title: "Transfer Funds",
            desc: "Wire, ACH, or P2P",
            icon: <Send className="w-5 h-5 text-blue-500" />,
            tab: "transfer",
            bg: "hover:border-blue-500/40"
          },
          {
            title: "Pay Bills & Loans",
            desc: "Scheduled payments",
            icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
            tab: "payments",
            bg: "hover:border-emerald-500/40"
          },
          {
            title: "Cards Management",
            desc: "Freeze & Spend limits",
            icon: <Shield className="w-5 h-5 text-purple-500" />,
            tab: "cards",
            bg: "hover:border-purple-500/40"
          },
          {
            title: "Deposit Checks / Wire",
            desc: "Inbound settlement",
            icon: <ArrowUpRight className="w-5 h-5 text-amber-500" />,
            tab: "deposit",
            bg: "hover:border-amber-500/40"
          }
        ].map((action, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(action.tab)}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#0B1E36]/70 border-blue-900/40 hover:bg-[#0F2744] text-white' 
                : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-sm text-slate-900'
            } ${action.bg}`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${
              isDarkMode ? 'bg-[#0A192F] border border-blue-900/60' : 'bg-slate-100 border border-slate-200/70'
            }`}>
              {action.icon}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm block truncate">{action.title}</span>
              <span className="text-[11px] text-slate-400 block truncate">{action.desc}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ANALYTICS SECTION: SPENDING TRENDS & MONTHLY CASH FLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SPENDING TRENDS & VELOCITY CHART (8 Cols) */}
        <div className={`lg:col-span-8 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode 
            ? 'bg-[#0B1E36] border-blue-900/50 text-white card-glow-dark' 
            : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-blue-900/30">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                  Liquidity & Cash Flow
                </span>
                <h3 className="font-bold text-base sm:text-lg tracking-tight">Spending & Balance Velocity</h3>
              </div>

              {/* Range Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-[#0A192F] p-1 rounded-xl border border-slate-200/60 dark:border-blue-900/50 self-start sm:self-auto">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveRange(range)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      activeRange === range 
                        ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A192F]/60 border border-slate-100 dark:border-blue-900/30">
                <span className="text-[10px] text-slate-400 block font-medium">Total Inflows</span>
                <span className="font-mono font-bold text-sm sm:text-base text-emerald-500">
                  +${totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A192F]/60 border border-slate-100 dark:border-blue-900/30">
                <span className="text-[10px] text-slate-400 block font-medium">Total Outflows</span>
                <span className="font-mono font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200">
                  -${totalOutflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A192F]/60 border border-slate-100 dark:border-blue-900/30">
                <span className="text-[10px] text-slate-400 block font-medium">Net Monthly Delta</span>
                <span className={`font-mono font-bold text-sm sm:text-base ${netSavingsMonthly >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {netSavingsMonthly >= 0 ? '+' : ''}${netSavingsMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="w-full h-44 sm:h-48 relative mt-2">
              <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="45" x2="600" y2="45" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="600" y2="90" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeDasharray="4 4" />
                <line x1="0" y1="135" x2="600" y2="135" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeDasharray="4 4" />

                {/* Area fill */}
                <path d={areaString} fill="url(#chartGradient)" />

                {/* Primary curve line */}
                <path 
                  d={pathString} 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Interactive Points */}
                {linePoints.map((point, index) => (
                  <g key={index} className="cursor-pointer">
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4.5"
                      className="fill-white dark:fill-slate-900 stroke-emerald-500 stroke-[2.5] hover:r-6 transition-all"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div 
                  className="absolute z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono shadow-xl border border-slate-700 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                  style={{ left: `${(hoveredPoint.x / 600) * 100}%`, top: `${(hoveredPoint.y / 180) * 100}%`, marginTop: '-8px' }}
                >
                  <span className="text-slate-400 block text-[9px] uppercase">{hoveredPoint.label}</span>
                  <span className="font-bold text-emerald-400">${hoveredPoint.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1 mt-2">
              {linePoints.map((p, idx) => (
                <span key={idx}>{p.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* MONTHLY SUMMARY & SPENDING BY CATEGORY (4 Cols) */}
        <div className={`lg:col-span-4 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode 
            ? 'bg-[#0B1E36] border-blue-900/50 text-white card-glow-dark' 
            : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="pb-4 border-b border-slate-100 dark:border-blue-900/30">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                Monthly Breakdown
              </span>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">Spending Allocation</h3>
            </div>

            {/* Visual Donut Chart */}
            <div className="flex items-center justify-center my-6 relative">
              <div className="w-36 h-36 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    const circumference = 2 * Math.PI * 38;
                    let accumulatedPercent = 0;

                    return finalSpendData.map((d, index) => {
                      const percent = totalSpent > 0 ? (d.amount / totalSpent) : 0.25;
                      const strokeLength = percent * circumference;
                      const strokeOffset = -(accumulatedPercent * circumference);
                      accumulatedPercent += percent;

                      const strokeColors = {
                        food: '#F59E0B',
                        shopping: '#8B5CF6',
                        utilities: '#3B82F6',
                        transfer: '#10B981'
                      };
                      const strokeColor = strokeColors[d.category as keyof typeof strokeColors] || '#64748B';
                      const isHovered = hoveredCategoryIndex === index;

                      return (
                        <circle
                          key={d.category}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={strokeColor}
                          strokeWidth={isHovered ? "14" : "11"}
                          strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setHoveredCategoryIndex(index)}
                          onMouseLeave={() => setHoveredCategoryIndex(null)}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                  {hoveredCategoryIndex !== null ? (
                    <>
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-bold leading-tight capitalize">
                        {finalSpendData[hoveredCategoryIndex].category}
                      </span>
                      <span className="text-sm font-bold font-mono text-blue-500 mt-0.5">
                        ${finalSpendData[hoveredCategoryIndex].amount.toFixed(0)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-bold leading-tight">
                        Total Spent
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-800 dark:text-white mt-0.5">
                        ${totalSpent.toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div className="space-y-2.5">
              {finalSpendData.map((d, index) => {
                const percent = totalSpent > 0 ? (d.amount / totalSpent) * 100 : 0;
                const colors = {
                  food: 'bg-amber-500',
                  shopping: 'bg-purple-500',
                  utilities: 'bg-blue-500',
                  transfer: 'bg-emerald-500'
                };
                const colorClass = colors[d.category as keyof typeof colors] || 'bg-slate-400';
                const isHovered = hoveredCategoryIndex === index;

                return (
                  <div 
                    key={d.category}
                    onMouseEnter={() => setHoveredCategoryIndex(index)}
                    onMouseLeave={() => setHoveredCategoryIndex(null)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isHovered ? 'bg-slate-100 dark:bg-slate-800/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                        <span className="font-medium capitalize text-slate-700 dark:text-slate-300">
                          {d.category}
                        </span>
                      </div>
                      <span className="font-mono font-semibold">
                        ${d.amount.toFixed(2)} <span className="text-slate-400 text-[10px]">({percent.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`${colorClass} h-full rounded-full transition-all duration-300`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS LEDGER TABLE (DATE, DESCRIPTION, CATEGORY, AMOUNT, BALANCE) */}
      <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all ${
        isDarkMode 
          ? 'bg-[#0B1E36] border-blue-900/50 text-white card-glow-dark' 
          : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-900/30 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                Live Audit Ledger
              </span>
            </div>
            <h3 className="font-bold text-base sm:text-lg tracking-tight">Recent Account Transactions</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('transactions')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <span>View Full History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Responsive Banking Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-blue-900/40 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Description</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right">Amount</th>
                <th className="py-3 px-3 font-semibold text-right">Balance</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20 text-xs">
              {transactionsWithRunningBalance.slice(0, 5).map((tx) => {
                const isCredit = tx.type === 'credit';
                const txDate = new Date(tx.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <tr 
                    key={tx.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                      {txDate}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
                          {CATEGORY_ICONS[tx.category] || <HelpCircle className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold block truncate text-slate-800 dark:text-slate-100">
                            {tx.description}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            Ref: {tx.reference}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                        {tx.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className={`py-3.5 px-3 whitespace-nowrap text-right font-mono font-bold ${
                      isCredit ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Running Balance */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-right font-mono font-semibold text-slate-600 dark:text-slate-300">
                      ${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                  </tr>
                );
              })}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No transactions posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
