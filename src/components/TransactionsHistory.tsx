import { useState, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowUpRight, ArrowDownRight, Coffee, ShoppingBag, Car, DollarSign, 
  HelpCircle, FileDown, Sparkles, Filter, FileText, Printer, X, ShieldCheck, 
  Check, Download, ChevronLeft, ChevronRight, Lock
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
  transfer: <ArrowUpRight className="w-4 h-4 text-blue-500" />,
  bonus: <Sparkles className="w-4 h-4 text-amber-400" />,
  adjustment: <HelpCircle className="w-4 h-4 text-slate-400" />,
};

export default function TransactionsHistory({ 
  transactions, 
  user, 
  wallet, 
  isDarkMode 
}: TransactionsHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [downloadingTx, setDownloadingTx] = useState<string | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<BankTransaction | null>(null);

  const currentAvailableBalance = wallet ? wallet.availableBalance : 34820.50;

  // Calculate Running Balance for each transaction
  const transactionsWithBalance = useMemo(() => {
    let running = currentAvailableBalance;
    return transactions.map((tx) => {
      const rowBal = running;
      if (tx.type === 'credit') {
        running = Math.max(0, running - tx.amount);
      } else {
        running = running + tx.amount;
      }
      return {
        ...tx,
        runningBalance: rowBal
      };
    });
  }, [transactions, currentAvailableBalance]);

  // Filter logic
  const filtered = transactionsWithBalance.filter((t) => {
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

  const netCashFlow = totalCredits - totalDebits;

  // Simulated PDF Downloader
  const handleDownloadReceipt = (tx: BankTransaction) => {
    setDownloadingTx(tx.id);
    setSelectedTxForReceipt(tx);
    setTimeout(() => {
      setDownloadingTx(null);
    }, 600);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Reference', 'Type', 'Amount', 'Status'];
    const rows = filtered.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.reference,
      t.type,
      t.type === 'credit' ? `+${t.amount.toFixed(2)}` : `-${t.amount.toFixed(2)}`,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexaBank_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* HEADER WITH SUMMARY & EXPORT */}
      <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDarkMode 
          ? 'bg-[#0B1E36] border-blue-900/50 text-white card-glow-dark' 
          : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
      }`}>
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block mb-1">
            Account Ledger
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Transactions & Settlement History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive audit log of all account deposits, debits, wires, and compounding yield.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDarkMode 
                ? 'bg-[#0A192F] border-blue-900/60 hover:bg-[#0F2744] text-slate-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowStatementModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <span>Monthly Statement</span>
          </button>
        </div>
      </div>

      {/* CASHFLOW SUMMARY MINI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#0B1E36]/80 border-blue-900/40 text-white' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Inflows</span>
            <span className="text-emerald-500 font-bold font-mono">+{transactions.filter(t => t.type === 'credit').length} TX</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-500 mt-1">
            +${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#0B1E36]/80 border-blue-900/40 text-white' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Outflows</span>
            <span className="text-slate-400 font-bold font-mono">-{transactions.filter(t => t.type === 'debit').length} TX</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
            -${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#0B1E36]/80 border-blue-900/40 text-white' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Period Delta</span>
            <span className={`text-[11px] font-bold font-mono ${netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {netCashFlow >= 0 ? 'SURPLUS' : 'DEFICIT'}
            </span>
          </div>
          <p className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        isDarkMode ? 'bg-[#0B1E36] border-blue-900/50' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, merchant, or reference ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0A192F] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Type selector */}
            <div className="flex bg-slate-100 dark:bg-[#0A192F] p-1 rounded-xl border border-slate-200 dark:border-blue-900/60">
              {(['all', 'credit', 'debit'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    filterType === type 
                      ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type === 'credit' ? 'Inflows' : 'Outflows'}
                </button>
              ))}
            </div>

            {/* Category dropdown */}
            <div className="flex items-center bg-slate-50 dark:bg-[#0A192F] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-blue-900/60">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none pr-3 capitalize font-semibold cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL BANKING TRANSACTIONS TABLE */}
      <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all ${
        isDarkMode 
          ? 'bg-[#0B1E36] border-blue-900/50 text-white card-glow-dark' 
          : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-blue-900/40 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3.5 px-3.5 font-semibold">Date</th>
                <th className="py-3.5 px-3.5 font-semibold">Description</th>
                <th className="py-3.5 px-3.5 font-semibold">Category</th>
                <th className="py-3.5 px-3.5 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-3.5 font-semibold text-right">Balance</th>
                <th className="py-3.5 px-3.5 font-semibold text-center">Status</th>
                <th className="py-3.5 px-3.5 font-semibold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20 text-xs">
              {filtered.map((tx) => {
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
                    <td className="py-4 px-3.5 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                      {txDate}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/50 shrink-0">
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
                    <td className="py-4 px-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tx.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className={`py-4 px-3.5 whitespace-nowrap text-right font-mono font-bold ${
                      isCredit ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Running Balance */}
                    <td className="py-4 px-3.5 whitespace-nowrap text-right font-mono font-semibold text-slate-600 dark:text-slate-300">
                      ${tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3.5 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    </td>

                    {/* Receipt Action */}
                    <td className="py-4 px-3.5 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDownloadReceipt(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        title="View Official Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HelpCircle className="w-8 h-8 opacity-40" />
                      <span className="font-semibold">No transactions match your search filter</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT VIEW MODAL */}
      <AnimatePresence>
        {selectedTxForReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md w-full p-6 sm:p-7 rounded-3xl border shadow-2xl relative ${
                isDarkMode ? 'bg-[#0B1E36] border-blue-900 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => setSelectedTxForReceipt(null)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">NexaBank Transaction Receipt</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Official Settled Record</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/40 space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-bold">{selectedTxForReceipt.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span>{new Date(selectedTxForReceipt.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Description:</span>
                  <span className="font-sans font-medium text-right max-w-[200px] truncate">{selectedTxForReceipt.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="capitalize">{selectedTxForReceipt.category}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-blue-900/40 text-sm">
                  <span className="text-slate-400">Amount:</span>
                  <span className={`font-bold ${selectedTxForReceipt.type === 'credit' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {selectedTxForReceipt.type === 'credit' ? '+' : '-'}${selectedTxForReceipt.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedTxForReceipt(null)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STATEMENT MODAL */}
      <AnimatePresence>
        {showStatementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-lg w-full p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${
                isDarkMode ? 'bg-[#0B1E36] border-blue-900 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => setShowStatementModal(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Generate Monthly Statement</h3>
                  <p className="text-xs text-slate-400">PDF Certified Account Transcript</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Download a fully verified, cryptographic bank statement including all transaction hashes, tax identifiers, and official ledger sign-offs.
              </p>

              <div className="space-y-3 mb-6 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/40 flex justify-between">
                  <span className="text-slate-400 font-sans">Period:</span>
                  <span className="font-bold">August 1, 2026 - August 31, 2026</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A192F] border border-slate-200/60 dark:border-blue-900/40 flex justify-between">
                  <span className="text-slate-400 font-sans">Total Transaction Volume:</span>
                  <span className="font-bold">${(totalCredits + totalDebits).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleExportCSV();
                    setShowStatementModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Statement (PDF)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
