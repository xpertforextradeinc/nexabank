import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowUpRight, ArrowDownRight, Coffee, ShoppingBag, Car, DollarSign, HelpCircle, FileDown, Sparkles, Filter 
} from 'lucide-react';
import { BankTransaction } from '../types';

interface TransactionsHistoryProps {
  transactions: BankTransaction[];
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

export default function TransactionsHistory({ transactions, isDarkMode }: TransactionsHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [downloadingTx, setDownloadingTx] = useState<string | null>(null);

  // Filter logic
  const filtered = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
      t.reference.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Categories list
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Simulated PDF Downloader
  const handleDownloadReceipt = (txId: string) => {
    setDownloadingTx(txId);
    setTimeout(() => {
      setDownloadingTx(null);
      alert(`Official transaction statement and PDF receipt for reference ${txId} generated and compiled successfully.`);
    }, 1500);
  };

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left w-full`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/10 mb-6">
        <div>
          <h3 className="font-display font-bold text-lg">Transaction Ledger Ledger</h3>
          <p className="text-xs text-slate-500 mt-0.5">Audit complete historical records and transaction roots.</p>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description or TX Reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-850">
            {(['all', 'credit', 'debit'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-sans font-medium text-xs uppercase tracking-wider transition ${
                  filterType === type 
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-emerald-400 shadow-sm font-semibold' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Category Selector dropdown */}
          <div className="relative flex items-center bg-slate-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-slate-150 dark:border-zinc-850">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-600 dark:text-zinc-300 focus:outline-none pr-3 capitalize font-semibold font-sans cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-x-auto">
        <div className="min-w-[650px] flex flex-col gap-2.5">
          {/* Header titles */}
          <div className="grid grid-cols-12 gap-3.5 px-4 text-[10px] font-mono text-slate-400 uppercase font-semibold pb-1 border-b border-slate-100/5">
            <div className="col-span-5">Transaction root & Date</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Reference ID</div>
            <div className="col-span-2 text-right">Settled Amount</div>
            <div className="col-span-1 text-center">Receipt</div>
          </div>

          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-8 h-8 opacity-45" />
                <span className="text-xs font-semibold">No records match filter query.</span>
                <p className="text-[10px]">Adjust active search constraints or type categories.</p>
              </div>
            ) : (
              filtered.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-12 gap-3.5 px-4 py-3.5 hover:bg-slate-50/5 border border-slate-100/10 hover:border-slate-100/20 rounded-xl items-center text-xs"
                >
                  {/* Info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200/5">
                      {CATEGORY_ICONS[tx.category] || <HelpCircle className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white leading-tight">{tx.description}</h4>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{tx.date}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-950 rounded-full text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-500 dark:text-zinc-400">
                      {tx.category}
                    </span>
                  </div>

                  {/* Reference */}
                  <div className="col-span-2 font-mono text-[10px] text-slate-400">
                    {tx.reference}
                  </div>

                  {/* Settled Amount */}
                  <div className="col-span-2 text-right">
                    <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-500 dark:text-zinc-300'}`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                    <span className="block text-[8px] text-slate-400 capitalize">{tx.status}</span>
                  </div>

                  {/* Receipt Download button */}
                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => handleDownloadReceipt(tx.id)}
                      disabled={downloadingTx === tx.id}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/10 rounded-lg transition disabled:opacity-40"
                      title="Download compliance PDF Receipt"
                      id={`btn-receipt-${tx.id}`}
                    >
                      <FileDown className={`w-4 h-4 ${downloadingTx === tx.id ? 'animate-spin text-indigo-500' : ''}`} />
                    </button>
                  </div>

                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
