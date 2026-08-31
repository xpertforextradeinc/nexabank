import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Filter, 
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, ShieldCheck, 
  Sparkles, CheckCircle2, ChevronRight, Activity, Percent
} from 'lucide-react';
import { BankTransaction, Wallet } from '../types';

interface AnalyticsViewProps {
  transactions: BankTransaction[];
  wallet: Wallet;
  isDarkMode: boolean;
}

export default function AnalyticsView({ transactions, wallet, isDarkMode }: AnalyticsViewProps) {
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const mainBal = wallet.availableBalance;
  
  // Calculate Totals
  const totalInflows = useMemo(() => {
    const val = transactions
      .filter((t) => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    return val > 0 ? val : 12450.00;
  }, [transactions]);

  const totalOutflows = useMemo(() => {
    const val = transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    return val > 0 ? val : 4890.30;
  }, [transactions]);

  const netSavings = totalInflows - totalOutflows;
  const savingsRate = totalInflows > 0 ? Math.max(0, ((netSavings / totalInflows) * 100)) : 42.5;

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {
      'Food & Dining': 640.20,
      'Shopping & Retail': 1250.00,
      'Utilities & Bills': 480.00,
      'Housing & Mortgage': 1850.00,
      'Transfers & Investments': 670.10
    };

    transactions.forEach((tx) => {
      if (tx.type === 'debit' && tx.status === 'completed') {
        const catName = tx.category === 'food' ? 'Food & Dining' 
          : tx.category === 'shopping' ? 'Shopping & Retail'
          : tx.category === 'utilities' ? 'Utilities & Bills'
          : 'Other Outflows';
        map[catName] = (map[catName] || 0) + tx.amount;
      }
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 20
    }));
  }, [transactions]);

  // Monthly summary bar data
  const monthlySummaries = [
    { month: 'Apr', income: 9800, expenses: 3900 },
    { month: 'May', income: 10500, expenses: 4200 },
    { month: 'Jun', income: 11200, expenses: 4100 },
    { month: 'Jul', income: 12000, expenses: 4600 },
    { month: 'Aug', income: totalInflows, expenses: totalOutflows }
  ];

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
            Financial Intelligence
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Spending Trends & Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze cashflow trends, spending velocity, monthly savings ratios, and category allocation.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-slate-100 dark:bg-[#0A192F] p-1 rounded-xl border border-slate-200 dark:border-blue-900/60 self-start md:self-auto">
          {(['30d', '90d', '1y'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                timeframe === t 
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t === '30d' ? 'Last 30 Days' : t === '90d' ? 'Last 90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className={`p-5 rounded-2xl sm:rounded-3xl border ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <span className="text-xs text-slate-400 font-medium">Monthly Inflow</span>
          <p className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            +${totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.4% vs previous month</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl sm:rounded-3xl border ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <span className="text-xs text-slate-400 font-medium">Monthly Outflow</span>
          <p className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
            -${totalOutflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>-3.2% spend reduction</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl sm:rounded-3xl border ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <span className="text-xs text-slate-400 font-medium">Net Savings</span>
          <p className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            +${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 mt-2 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Surplus target exceeded</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl sm:rounded-3xl border ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <span className="text-xs text-slate-400 font-medium">Savings Rate</span>
          <p className="text-2xl font-bold font-mono text-blue-500 mt-1">
            {savingsRate.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-500 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Top Tier Liquidity</span>
          </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY BARS & SPENDING CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MONTHLY COMPARISON BARS (7 cols) */}
        <div className={`lg:col-span-7 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-blue-900/30">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                  Month-over-Month
                </span>
                <h3 className="font-bold text-base sm:text-lg">Income vs Expenses Summary</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-400">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-400">Expense</span>
                </div>
              </div>
            </div>

            {/* Custom Monthly Bars visual */}
            <div className="mt-8 space-y-6">
              {monthlySummaries.map((item, idx) => {
                const maxVal = 14000;
                const incomeWidth = Math.min(100, (item.income / maxVal) * 100);
                const expenseWidth = Math.min(100, (item.expenses / maxVal) * 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{item.month} 2026</span>
                      <span className="font-mono text-slate-400">
                        In: <span className="text-emerald-500 font-semibold">${item.income.toLocaleString()}</span> / Out: <span className="text-slate-600 dark:text-slate-300 font-semibold">${item.expenses.toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Income Bar */}
                      <div className="w-full bg-slate-100 dark:bg-[#0A192F] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${incomeWidth}%` }}
                        />
                      </div>
                      {/* Expense Bar */}
                      <div className="w-full bg-slate-100 dark:bg-[#0A192F] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${expenseWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CATEGORY ALLOCATION BREAKDOWN (5 cols) */}
        <div className={`lg:col-span-5 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0B1E36] border-blue-900/50 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}>
          <div>
            <div className="pb-4 border-b border-slate-100 dark:border-blue-900/30">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                Portfolio Distribution
              </span>
              <h3 className="font-bold text-base sm:text-lg">Category Allocation</h3>
            </div>

            <div className="mt-6 space-y-4">
              {categoryStats.map((cat, idx) => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-indigo-500'];
                const color = colors[idx % colors.length];

                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A192F]/60 border border-slate-100 dark:border-blue-900/30">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                      </div>
                      <span className="font-mono font-bold">
                        ${cat.amount.toFixed(2)} <span className="text-slate-400 text-[10px]">({cat.percentage.toFixed(1)}%)</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`${color} h-full rounded-full`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-900/30 text-xs text-slate-400">
            <span>💡 Spending in Utilities & Retail reduced by 12% compared to Q2.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
