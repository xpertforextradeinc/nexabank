import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowUpRight, ArrowDownRight, Coffee, ShoppingBag, Car, DollarSign, HelpCircle, FileDown, Sparkles, Filter, FileText, Printer, X, ShieldCheck 
} from 'lucide-react';
import { BankTransaction, UserProfile, Wallet } from '../types';

interface TransactionsHistoryProps {
  transactions: BankTransaction[];
  user?: UserProfile;
  wallet?: Wallet;
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

export default function TransactionsHistory({ transactions, user, wallet, isDarkMode }: TransactionsHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [downloadingTx, setDownloadingTx] = useState<string | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);

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

  // Financial Statement Totals
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFees = transactions
    .filter(t => t.category === 'transfer' || t.category === 'withdrawal')
    .length * 1.50; // Estimated processing fee allowance

  const endingBalance = wallet ? wallet.availableBalance : 14250.00;
  const startingBalance = endingBalance - totalCredits + totalDebits;

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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStatementModal(true)}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          id="btn-export-statement"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Export Statement</span>
        </motion.button>
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

      {/* Official Statement Modal */}
      <AnimatePresence>
        {showStatementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-10 text-slate-900 dark:text-white relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowStatementModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Statement Header */}
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-bold tracking-tight">NEXA BANK, N.A.</h2>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">OFFICIAL STATEMENT OF ACCOUNT</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Statement Date</span>
                    <span className="text-xs font-mono font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Account Details Block */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Account Holder</span>
                    <span className="font-semibold font-sans mt-0.5 block">{user?.name || 'Valued Client'}</span>
                    <span className="text-[11px] text-slate-500">{user?.email || 'client@nexabank.com'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Account Number (Masked)</span>
                    <span className="font-mono font-semibold mt-0.5 block">•••• {user?.accountNumber ? user.accountNumber.slice(-4) : '4829'}</span>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3" /> FDIC Insured Up to $250,000
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Routing Number (ABA)</span>
                    <span className="font-mono font-semibold mt-0.5 block">{user?.routingNumber || '021000021'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Federal Reserve Bank NY</span>
                  </div>
                </div>
              </div>

              {/* Summary Ledger Matrix */}
              <div className="mb-8">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-3">Summary Ledger Matrix</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Starting Balance</span>
                    <span className="font-mono font-bold text-sm mt-1 block">${startingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Settled Credits</span>
                    <span className="font-mono font-bold text-sm text-emerald-500 mt-1 block">+${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Settled Debits</span>
                    <span className="font-mono font-bold text-sm text-slate-600 dark:text-zinc-300 mt-1 block">-${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Network Fees Paid</span>
                    <span className="font-mono font-bold text-sm text-amber-500 mt-1 block">${totalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Ending Balance</span>
                    <span className="font-mono font-bold text-sm text-indigo-500 mt-1 block">${endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Ledger List */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Itemized Transaction Records ({transactions.length} entries)</h4>
                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-100 dark:bg-zinc-900 px-4 py-2.5 text-[10px] font-mono uppercase font-bold text-slate-500">
                    <div className="col-span-3">Date</div>
                    <div className="col-span-4">Description / Reference</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3 text-right">Net Amount</div>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-900 max-h-60 overflow-y-auto">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="grid grid-cols-12 px-4 py-2.5 text-xs items-center">
                        <div className="col-span-3 font-mono text-[11px] text-slate-400">{tx.date}</div>
                        <div className="col-span-4">
                          <span className="font-semibold block leading-tight">{tx.description}</span>
                          <span className="font-mono text-[9px] text-slate-400">{tx.reference}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400">
                            {tx.type}
                          </span>
                        </div>
                        <div className={`col-span-3 text-right font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-700 dark:text-zinc-300'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-900 transition"
                >
                  Close Statement
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print / Download PDF</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
