import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, ArrowUpRight, ArrowDownRight, Coffee, ShoppingBag, Car, DollarSign, Video, AlertCircle, Sparkles } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionSimulatorProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  selectedAccount: string;
}

const CATEGORY_ICONS: Record<string, ReactNode> = {
  Food: <Coffee className="w-4 h-4 text-amber-500" />,
  Shopping: <ShoppingBag className="w-4 h-4 text-purple-500" />,
  Transport: <Car className="w-4 h-4 text-blue-500" />,
  Salary: <DollarSign className="w-4 h-4 text-emerald-500" />,
  Entertainment: <Video className="w-4 h-4 text-rose-500" />,
  Transfer: <ArrowUpRight className="w-4 h-4 text-indigo-500" />,
};

const SIMULATION_TEMPLATES = [
  { description: 'Starbucks Coffee', amount: 6.80, category: 'Food', type: 'expense' as const },
  { description: 'Whole Foods Grocery', amount: 48.30, category: 'Food', type: 'expense' as const },
  { description: 'Steam Games Store', amount: 24.99, category: 'Entertainment', type: 'expense' as const },
  { description: 'Uber Ride', amount: 18.50, category: 'Transport', type: 'expense' as const },
  { description: 'Netflix Subscription', amount: 15.49, category: 'Entertainment', type: 'expense' as const },
  { description: 'Zara Apparel', amount: 89.00, category: 'Shopping', type: 'expense' as const },
  { description: 'Nexa Corp Salary', amount: 2450.00, category: 'Salary', type: 'income' as const },
  { description: 'Cash Deposit ATM', amount: 150.00, category: 'Salary', type: 'income' as const },
];

export default function TransactionSimulator({ transactions, onAddTransaction, selectedAccount }: TransactionSimulatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');

  const handleSimulate = () => {
    // Pick a random template
    const template = SIMULATION_TEMPLATES[Math.floor(Math.random() * SIMULATION_TEMPLATES.length)];
    onAddTransaction({
      description: template.description,
      amount: template.amount,
      category: template.category,
      type: template.type,
      status: 'completed',
    });
  };

  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || tx.type === activeFilter;
      return matchesSearch && matchesFilter;
    });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
      {/* Header with Simulator Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-50 mb-4">
        <div>
          <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-2">
            Timeline Simulator
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700">
              Live Feed
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Simulate realistic transaction payloads to test ledger updates.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-sans font-medium text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
          id="btn-simulate-transaction"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Simulate Purchase
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search payload or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-sans text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            id="input-transaction-search"
          />
        </div>

        {/* Filters */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          {(['all', 'income', 'expense'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg font-sans font-medium text-xs transition-all uppercase tracking-wider ${
                activeFilter === filter
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              id={`btn-tx-filter-${filter}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1.5 scrollbar-thin">
        <AnimatePresence initial={false}>
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-2"
            >
              <AlertCircle className="w-8 h-8 opacity-40" />
              <span className="font-display font-medium text-xs text-slate-600">No Transactions Found</span>
              <p className="text-[11px]">Simulate a purchase or clear the active query filters.</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredTransactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/75 border border-slate-50 hover:border-slate-100 rounded-xl transition-all duration-200"
                  id={`transaction-item-${tx.id}`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Visual Icon */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/30 flex items-center justify-center">
                      {CATEGORY_ICONS[tx.category] || <DollarSign className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div>
                      <h4 className="font-display font-medium text-xs text-slate-900 leading-tight">
                        {tx.description}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-[10px] text-slate-400">
                          {tx.date}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] text-slate-500">
                          {tx.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount and status */}
                  <div className="flex flex-col items-end">
                    <span
                      className={`font-mono font-semibold text-xs ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center text-[9px] text-slate-400 capitalize mt-0.5">
                      {tx.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom ledger info */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>LEDGER ACTIVE FOR: {selectedAccount.toUpperCase()}</span>
        <span>TOTAL ENTRIES: {transactions.length}</span>
      </div>
    </div>
  );
}
