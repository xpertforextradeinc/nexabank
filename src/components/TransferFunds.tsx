import { useState, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, CheckCircle2, AlertCircle, Sparkles, Loader2, ArrowRight, 
  Building2, Globe, Search, ShieldCheck, Check, Zap, Copy, Download, 
  UserCheck, RefreshCw, FileText, Wallet as WalletIcon, CheckCircle
} from 'lucide-react';
import { UserProfile, Wallet } from '../types';
import { createIncreaseTransfer } from '../services/increase';

interface TransferFundsProps {
  user: UserProfile;
  wallet: Wallet;
  usersList: UserProfile[];
  onTransfer: (recipientId: string, amount: number) => void;
  isDarkMode: boolean;
}

const MAJOR_BANKS = [
  'JPMorgan Chase Bank',
  'Bank of America',
  'Wells Fargo Bank',
  'Citibank N.A.',
  'Capital One',
  'Fidelity Investments',
  'Charles Schwab',
  'TD Bank',
  'PNC Bank',
  'U.S. Bank'
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'United Arab Emirates',
  'Singapore',
  'Australia',
  'Switzerland',
  'Japan'
];

const NETWORK_FEE_SCHEDULE = {
  'FedNow / Real-Time Payments (RTP)': 1.50,
  'Same-Day ACH Routing': 0.50,
  'Standard Nexa Instant P2P': 0.00
};

export default function TransferFunds({ user, wallet, usersList, onTransfer, isDarkMode }: TransferFundsProps) {
  const [activeTab, setActiveTab] = useState<'peer' | 'ach' | 'swift'>('peer');
  
  // Peer Transfer States
  const [searchQuery, setSearchQuery] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<keyof typeof NETWORK_FEE_SCHEDULE>('FedNow / Real-Time Payments (RTP)');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<{
    reference: string;
    amount: number;
    fee: number;
    totalDebit: number;
    recipientName: string;
    recipientEmail: string;
    type: string;
    date: string;
  } | null>(null);

  // Computed fees & total debit
  const numericAmount = parseFloat(amount) || 0;
  const processingFee = NETWORK_FEE_SCHEDULE[selectedNetwork] ?? 1.50;
  const totalDebitAmount = numericAmount > 0 ? numericAmount + processingFee : 0;
  const hasSufficientBalance = wallet.availableBalance >= totalDebitAmount;

  // ACH / Domestic Bank States
  const [achRecipientName, setAchRecipientName] = useState('');
  const [achBankName, setAchBankName] = useState(MAJOR_BANKS[0]);
  const [achRouting, setAchRouting] = useState('');
  const [achAccount, setAchAccount] = useState('');

  // SWIFT / International Bank States
  const [swiftRecipientName, setSwiftRecipientName] = useState('');
  const [swiftCountry, setSwiftCountry] = useState(COUNTRIES[0]);
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');

  // Copy reference state
  const [copiedRef, setCopiedRef] = useState(false);

  // Filter peer recipients (excluding logged in user)
  const peerRecipients = useMemo(() => {
    return usersList.filter(u => u.id !== user.id);
  }, [usersList, user.id]);

  const filteredPeers = useMemo(() => {
    if (!searchQuery.trim()) return peerRecipients;
    const q = searchQuery.toLowerCase().trim();
    return peerRecipients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.email.toLowerCase().includes(q) ||
      p.accountNumber?.includes(q)
    );
  }, [peerRecipients, searchQuery]);

  // Found recipient preview
  const selectedTargetPeer = useMemo(() => {
    if (!recipientEmail) return null;
    return peerRecipients.find(u => u.email.toLowerCase().trim() === recipientEmail.toLowerCase().trim());
  }, [peerRecipients, recipientEmail]);

  const handleSelectPeer = (peer: UserProfile) => {
    setRecipientEmail(peer.email);
    setError('');
  };

  const handleTransferSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0.99) {
      setError('Minimum transfer limit is $1.00 USD.');
      return;
    }

    if (!hasSufficientBalance) {
      setError('Insufficient balance to cover transaction and processing fees.');
      return;
    }

    // Safety status checks
    if (user.status === 'frozen') {
      setError('Your ledger accounts are currently frozen. Outbound transfers are blocked by compliance.');
      return;
    }
    if (user.status === 'hold') {
      setError('Your account is on administrative hold. No transfers can be executed.');
      return;
    }

    const finalMemo = `[Fee: $${processingFee.toFixed(2)} via ${selectedNetwork}] ${memo}`.trim();

    if (activeTab === 'peer') {
      if (!recipientEmail.trim()) {
        setError('Please specify or select a recipient email address.');
        return;
      }

      const targetUser = selectedTargetPeer || usersList.find(u => u.email.toLowerCase().trim() === recipientEmail.toLowerCase().trim());
      if (!targetUser) {
        setError('The specified recipient email address was not found in NexaBank registries.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onTransfer(targetUser.id, totalDebitAmount);
        
        // Open interactive receipt
        setReceipt({
          reference: `NXTR-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: amt,
          fee: processingFee,
          totalDebit: totalDebitAmount,
          recipientName: targetUser.name,
          recipientEmail: targetUser.email,
          type: `Instant P2P (${selectedNetwork})`,
          date: new Date().toLocaleString()
        });
        setAmount('');
        setMemo('');
      }, 1200);

    } else if (activeTab === 'ach') {
      if (!achRecipientName.trim() || !achRouting.trim() || !achAccount.trim()) {
        setError('Please complete all required bank routing and account fields.');
        return;
      }
      if (achRouting.length < 9) {
        setError('ABA Wire Routing number must be exactly 9 digits.');
        return;
      }

      setLoading(true);
      
      try {
        if (user.increaseAccountId) {
          // Call Increase Sandbox API
          await createIncreaseTransfer({
            accountId: user.increaseAccountId,
            amount: Math.round(totalDebitAmount * 100), // convert to cents
            accountNumber: achAccount,
            routingNumber: achRouting,
            memo: finalMemo
          });
        }
        
        setLoading(false);
        const fallbackTarget = peerRecipients[0] || user;
        onTransfer(fallbackTarget.id, totalDebitAmount);

        setReceipt({
          reference: `ACH-US-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: amt,
          fee: processingFee,
          totalDebit: totalDebitAmount,
          recipientName: `${achRecipientName} (${achBankName})`,
          recipientEmail: `ABA ${achRouting} • Acc ****${achAccount.slice(-4) || '8841'}`,
          type: `Domestic ACH (${selectedNetwork})`,
          date: new Date().toLocaleString()
        });
        setAmount('');
        setAchRecipientName('');
        setAchRouting('');
        setAchAccount('');
        setMemo('');
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Increase API ACH transfer failed.');
      }
    } else if (activeTab === 'swift') {
      if (!swiftRecipientName.trim() || !swiftCode.trim() || !iban.trim()) {
        setError('Please complete all global SWIFT and IBAN details.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const fallbackTarget = peerRecipients[0] || user;
        onTransfer(fallbackTarget.id, totalDebitAmount);

        setReceipt({
          reference: `SWIFT-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: amt,
          fee: processingFee,
          totalDebit: totalDebitAmount,
          recipientName: `${swiftRecipientName} (${swiftCountry})`,
          recipientEmail: `BIC: ${swiftCode.toUpperCase()} • IBAN ${iban.slice(0, 4)}...${iban.slice(-4)}`,
          type: `Global SWIFT (${selectedNetwork})`,
          date: new Date().toLocaleString()
        });
        setAmount('');
        setSwiftRecipientName('');
        setSwiftCode('');
        setIban('');
      }, 1800);
    }
  };

  const copyRefToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Header & Balance Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Direct Settlement Route
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Money Transfer & Peer Settlement</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
              Execute zero-fee instant peer-to-peer transfers inside NexaBank network or dispatch domestic ACH wire and international SWIFT transactions.
            </p>
          </div>

          {/* Balance Pill Card */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200/60'}`}>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Available to Transfer</span>
              <span className="text-xl font-mono font-bold text-indigo-500 dark:text-indigo-400">
                ${wallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] font-mono text-emerald-500 block uppercase font-bold mt-0.5">
                ● 0.00% WIRE SETTLEMENT FEE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => { setActiveTab('peer'); setError(''); }}
          className={`py-3 px-3 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'peer'
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Peer Instant Pay</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('ach'); setError(''); }}
          className={`py-3 px-3 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'ach'
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Domestic Bank ACH</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('swift'); setError(''); }}
          className={`py-3 px-3 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'swift'
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>International SWIFT</span>
        </button>
      </div>

      {/* Main Transfer Form Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative`}>
        
        {/* Interactive Receipt Overlay */}
        <AnimatePresence>
          {receipt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl z-30 p-6 sm:p-8 flex flex-col items-center justify-between text-center overflow-y-auto"
            >
              <div className="w-full max-w-md mx-auto space-y-4 my-auto">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold block mb-1">
                    ● SETTLEMENT CONFIRMED
                  </span>
                  <h3 className="text-2xl font-display font-bold">Transfer Executed Successfully</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    The transaction has been cleared on the Nexa digital ledger.
                  </p>
                </div>

                <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white my-2">
                  ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-sans text-slate-400 font-normal">USD</span>
                </div>

                {/* Receipt Details Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 text-left space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/40 dark:border-zinc-850">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Reference Code</span>
                    <button
                      type="button"
                      onClick={() => copyRefToClipboard(receipt.reference)}
                      className="font-mono font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{receipt.reference}</span>
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Recipient</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{receipt.recipientName}</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Route / Address</span>
                    <span className="text-slate-500 dark:text-zinc-400 font-mono text-[11px] truncate max-w-[200px]">{receipt.recipientEmail}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Transfer Method</span>
                    <span className="text-slate-700 dark:text-zinc-300 font-semibold">{receipt.type}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Transfer Amount</span>
                    <span className="font-mono font-semibold">${receipt.amount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Fee Charged</span>
                    <span className="font-mono font-semibold text-amber-500">${receipt.fee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/40 dark:border-zinc-850">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Total Debit</span>
                    <span className="font-mono font-bold text-indigo-500">${receipt.totalDebit.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/40 dark:border-zinc-850">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Date & Time</span>
                    <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10px]">{receipt.date}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl font-display font-bold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                  >
                    Done / Return
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleTransferSubmit} className="space-y-6">
          
          {/* TAB 1: PEER INSTANT PAY */}
          {activeTab === 'peer' && (
            <div className="space-y-5">
              {/* Peer Recipient Selection */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Select Registered NexaBank Peer
                  </span>
                  {selectedTargetPeer && (
                    <span className="text-[10px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Nexa Member
                    </span>
                  )}
                </div>

                {/* Peer Search Input */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search peers by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Peer Avatar Carousel */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {filteredPeers.length > 0 ? (
                    filteredPeers.map((peer) => {
                      const isSelected = recipientEmail.toLowerCase().trim() === peer.email.toLowerCase().trim();
                      return (
                        <button
                          key={peer.id}
                          type="button"
                          onClick={() => handleSelectPeer(peer)}
                          className={`flex flex-col items-center p-3 rounded-2xl border transition min-w-[100px] cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm ring-2 ring-indigo-500/20'
                              : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/50 text-slate-700 dark:text-zinc-300'
                          }`}
                          id={`peer-select-${peer.id}`}
                        >
                          <div className="relative mb-2">
                            <img
                              src={peer.avatar}
                              alt={peer.name}
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                            />
                            {isSelected && (
                              <div className="absolute -bottom-1 -right-1 p-0.5 bg-indigo-500 text-white rounded-full">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-center truncate w-full font-semibold">{peer.name.split(' ')[0]}</span>
                          <span className="text-[9px] font-mono text-slate-400 text-center truncate w-full mt-0.5">
                            {peer.email.split('@')[0]}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 w-full">
                      No matching peers found. You can manually type an email address below.
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Recipient Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  OR ENTER RECIPIENT EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. peer@nexabank.com"
                    value={recipientEmail}
                    onChange={(e) => {
                      setRecipientEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    id="input-transfer-recipient"
                  />
                  {selectedTargetPeer && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {selectedTargetPeer.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOMESTIC BANK ACH */}
          {activeTab === 'ach' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-3">
                <Building2 className="w-5 h-5 shrink-0 text-amber-500" />
                <span>Domestic ACH transfers dispatch within 1 business day via FedWire / Clearing House protocols. zero transfer fee.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Recipient Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Johnathan Doe"
                    value={achRecipientName}
                    onChange={(e) => setAchRecipientName(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Destination Bank</label>
                  <select
                    value={achBankName}
                    onChange={(e) => setAchBankName(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {MAJOR_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">ABA Routing Number (9 Digits)</label>
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="021000021"
                    value={achRouting}
                    onChange={(e) => setAchRouting(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Account Number</label>
                  <input
                    type="text"
                    placeholder="9021849201"
                    value={achAccount}
                    onChange={(e) => setAchAccount(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERNATIONAL SWIFT */}
          {activeTab === 'swift' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                <Globe className="w-5 h-5 shrink-0 text-indigo-500" />
                <span>International wires clear through SWIFT global banking network with automatic currency conversion.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Beneficiary Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Sharapova"
                    value={swiftRecipientName}
                    onChange={(e) => setSwiftRecipientName(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Destination Country</label>
                  <select
                    value={swiftCountry}
                    onChange={(e) => setSwiftCountry(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CHASUS33XXX"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400">IBAN / International Account Number</label>
                  <input
                    type="text"
                    placeholder="GB82 WEST 1234 5698 7654 32"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AMOUNT INPUT & PRESETS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                SPECIFY TRANSFER AMOUNT (USD)
              </label>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Max Available: <strong className="text-indigo-500 font-mono">${wallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="500.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="w-full pl-9 pr-24 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl font-mono text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                id="input-transfer-amount"
              />
              <button
                type="button"
                onClick={() => setAmount(wallet.availableBalance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-mono text-xs font-bold rounded-xl transition cursor-pointer"
              >
                USE MAX
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmount(preset.toString()); setError(''); }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono text-xs font-semibold transition cursor-pointer"
                >
                  +${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Network Speed Routing Method Dropdown & Fee Breakdown */}
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              US NETWORK SPEED ROUTING METHOD & FEE SCHEDULE
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value as any)}
              className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              id="select-network-routing"
            >
              <option value="FedNow / Real-Time Payments (RTP)">FedNow / Real-Time Payments (RTP) — $1.50 Fee</option>
              <option value="Same-Day ACH Routing">Same-Day ACH Routing — $0.50 Fee</option>
              <option value="Standard Nexa Instant P2P">Standard Nexa Instant P2P — $0.00 Fee</option>
            </select>

            {/* Line-item breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/60 dark:border-zinc-850 space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                <span>Transfer Amount:</span>
                <span className="font-mono font-semibold">${numericAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
                <span>Processing Network Fee:</span>
                <span className="font-mono font-semibold text-amber-500">${processingFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/40 dark:border-zinc-800 flex justify-between items-center font-display font-bold text-slate-900 dark:text-white text-sm">
                <span>Total Debit Amount:</span>
                <span className="font-mono text-indigo-500">${totalDebitAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Insufficient balance warning block */}
            {!hasSufficientBalance && numericAmount > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Insufficient balance to cover transaction and processing fees.</span>
              </div>
            )}
          </div>

          {/* Optional Memo */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              PAYMENT REFERENCE / MEMO (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly rent split, Dinner reimbursement, Invoice #1042"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10 transition hover:scale-101 active:scale-99 disabled:opacity-50"
            id="btn-transfer-submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Real-Time Ledger Route...
              </>
            ) : (
              <>
                <span>Execute Real-Time Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
