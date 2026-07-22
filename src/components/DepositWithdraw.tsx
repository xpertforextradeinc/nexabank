import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, ArrowDownRight, ArrowRight, Shield, QrCode, Clipboard, Check, Sparkles, AlertCircle, CheckCircle2, DollarSign, Loader2, Key, HelpCircle, ChevronRight, Wallet as WalletIcon, Search
} from 'lucide-react';
import { UserProfile, Wallet } from '../types';

interface DepositWithdrawProps {
  user: UserProfile;
  wallet: Wallet;
  onAddDeposit: (amount: number, method: 'bank_wire' | 'crypto_usdt' | 'credit_card') => void;
  onAddWithdrawal: (amount: number, method: 'bank_wire' | 'crypto_usdt' | 'cash_app' | 'zelle' | 'venmo', pin?: string, payload?: any) => string | null | Promise<string | null>; // returns error message if any
  isDarkMode: boolean;
}

const MAJOR_US_BANKS = [
  'Chase',
  'Bank of America',
  'Wells Fargo',
  'Citi',
  'Capital One',
  'PNC',
  'U.S. Bank',
  'Truist',
  'Fifth Third'
];

export default function DepositWithdraw({ user, wallet, onAddDeposit, onAddWithdrawal, isDarkMode }: DepositWithdrawProps) {
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');
  
  // Deposit States
  const [depAmount, setDepAmount] = useState('');
  const [depMethod, setDepMethod] = useState<'bank_wire' | 'crypto_usdt' | 'credit_card'>('bank_wire');
  const [copied, setCopied] = useState(false);
  const [depSuccess, setDepSuccess] = useState(false);

  // Withdrawal States
  const [wthAmount, setWthAmount] = useState('');
  const [wthTab, setWthTab] = useState<'crypto' | 'us_bank'>('crypto');
  
  // Crypto States
  const [cryptoCurrency, setCryptoCurrency] = useState('USDT');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC-20');
  
  // US Bank States
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const [enteredPin, setEnteredPin] = useState('');
  const [wthSuccess, setWthSuccess] = useState(false);
  
  // Errors & loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Processing Fees Calculation
  const parsedAmount = parseFloat(wthAmount) || 0;
  const feeRate = wthTab === 'crypto' ? 0.015 : 0.005; // Crypto 1.5%, Bank Wire 0.5%
  const calculatedFee = parsedAmount * feeRate;
  const totalDeduction = parsedAmount + calculatedFee;

  const handleCopyAddress = () => {
    const addressToCopy = user.assignedCryptoWallet || '0x77E125D9B6C2e359F67b97c489b0Ca7dB124c6F1';
    navigator.clipboard.writeText(addressToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt <= 10) {
      setError('Minimum deposit amount allowed is $10.00.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAddDeposit(amt, depMethod);
      setDepSuccess(true);
      setDepAmount('');
      setTimeout(() => setDepSuccess(false), 5000);
    }, 1500);
  };

  const handleWithdrawalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(wthAmount);

    if (isNaN(amt) || amt <= 20) {
      setError('Minimum withdrawal allowed is $20.00.');
      return;
    }

    if (totalDeduction > wallet.availableBalance) {
      setError(`Insufficient available balance. Total discharge required (with fee): $${totalDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Your available balance is $${wallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`);
      return;
    }

    // Validation for Crypto Option
    if (wthTab === 'crypto') {
      if (!cryptoAddress) {
        setError('Recipient Wallet Address is required.');
        return;
      }
      if (cryptoAddress.length < 25) {
        setError('Recipient Wallet Address must be a valid cryptographic address (minimum 25 characters).');
        return;
      }
      const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(cryptoAddress);
      if (!isAlphanumeric) {
        setError('Recipient Wallet Address must contain only letters and numbers.');
        return;
      }
    }

    // Validation for US Bank Option
    if (wthTab === 'us_bank') {
      if (!selectedBank) {
        setError('Please select a United States Bank from the dropdown list.');
        return;
      }
      if (!routingNumber) {
        setError('9-Digit Routing Number is required.');
        return;
      }
      if (routingNumber.length !== 9 || isNaN(Number(routingNumber))) {
        setError('Routing Number must be exactly 9 digits and contain only numbers.');
        return;
      }
      if (!accountNumber) {
        setError('Account Number is required.');
        return;
      }
      if (accountNumber.length < 4 || accountNumber.length > 17 || isNaN(Number(accountNumber))) {
        setError('Account Number must be between 4 and 17 numeric digits.');
        return;
      }
      if (!accountHolderName) {
        setError('Account Holder Full Name is required.');
        return;
      }
      if (accountHolderName.trim().length < 3) {
        setError('Account Holder Full Name must be at least 3 characters.');
        return;
      }
    }

    // Safety checks
    if (user.status === 'frozen') {
      setError('Transactional assets are frozen. Withdrawals locked by compliance policy.');
      return;
    }

    if (user.status === 'hold') {
      setError('Account is currently on hold. Administrative lock prevents outbound ledger activities.');
      return;
    }

    // Check withdrawal PIN requirement
    if (user.withdrawalPinRequired) {
      if (!enteredPin) {
        setError('Security code (Withdrawal PIN) is required to approve this payout.');
        return;
      }
      if (enteredPin !== user.withdrawalPin) {
        setError('Incorrect security PIN. Please contact administration or reset in security settings.');
        return;
      }
    }

    setLoading(true);

    let method: 'bank_wire' | 'crypto_usdt' = 'bank_wire';
    let payload = {};

    if (wthTab === 'crypto') {
      method = 'crypto_usdt';
      payload = {
        type: 'crypto',
        currency: cryptoCurrency,
        address: cryptoAddress,
        network: cryptoNetwork,
        fee: calculatedFee,
        netAmount: amt,
        grossAmount: totalDeduction,
        submittedAt: new Date().toISOString()
      };
    } else {
      method = 'bank_wire';
      payload = {
        type: 'us_bank',
        bankName: selectedBank,
        routingNumber: routingNumber,
        accountNumber: accountNumber,
        accountHolderName: accountHolderName,
        fee: calculatedFee,
        netAmount: amt,
        grossAmount: totalDeduction,
        submittedAt: new Date().toISOString()
      };
    }

    try {
      const result = onAddWithdrawal(totalDeduction, method, enteredPin, payload);
      const wthError = result instanceof Promise ? await result : result;
      setLoading(false);
      if (wthError) {
        setError(wthError);
        return;
      }
      setWthSuccess(true);
      setWthAmount('');
      setEnteredPin('');
      setCryptoAddress('');
      setRoutingNumber('');
      setAccountNumber('');
      setAccountHolderName('');
      setBankSearch('');
      setSelectedBank('');
      setTimeout(() => setWthSuccess(false), 5000);
    } catch (e: any) {
      setLoading(false);
      setError(e.message || 'An unexpected server error occurred.');
    }
  };

  const filteredBanks = MAJOR_US_BANKS.filter(bank => 
    bank.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full text-left">
      
      {/* Tab Select Side-Column (4 columns) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
          <h3 className="font-display font-semibold text-base mb-1">Treasury Handshake</h3>
          <p className="text-xs text-slate-500 mb-5">Execute transfer or funding instructions into the active bank ledger.</p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveAction('deposit');
                setError('');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                activeAction === 'deposit'
                  ? 'border-emerald-500 bg-emerald-50/10 text-emerald-600'
                  : 'border-slate-100/10 bg-transparent hover:bg-slate-50/5 text-slate-400'
              }`}
              id="tab-deposit"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/15 rounded-xl text-emerald-500">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">Deposit Funds</span>
                  <span className="text-[10px] text-slate-400 font-sans">Bank wire, crypto, card</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveAction('withdraw');
                setError('');
              }}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                activeAction === 'withdraw'
                  ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600'
                  : 'border-slate-100/10 bg-transparent hover:bg-slate-50/5 text-slate-400'
              }`}
              id="tab-withdraw"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/15 rounded-xl text-indigo-500">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">Withdraw Cash</span>
                  <span className="text-[10px] text-slate-400 font-sans">Instant payouts & crypto</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Balance indicator */}
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Available to Withdraw</span>
          <h2 className="text-2xl font-display font-semibold tracking-tight">
            ${wallet.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          {user.status === 'frozen' && (
            <p className="text-[10px] text-rose-500 mt-2 font-semibold">● Assets frozen by compliance policy.</p>
          )}
        </div>
      </div>

      {/* Main Form Area (8 columns) */}
      <div className="lg:col-span-8">
        
        {/* DEPOSIT COMPONENT */}
        {activeAction === 'deposit' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative`}>
            
            <AnimatePresence>
              {depSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl z-20 flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 rounded-full mb-4">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">Deposit Logged!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1.5">
                    Your deposit request has been registered and is queueing for institutional settlement. Estimated settlement time: **5-10 minutes**.
                  </p>
                  <button
                    onClick={() => setDepSuccess(false)}
                    className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl font-sans text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-6">
              <h3 className="font-display font-bold text-lg">Fund Account Vault</h3>
              <p className="text-xs text-slate-500 mt-0.5">Deploy payments to increase your active ledger balances.</p>
            </div>

            <form onSubmit={handleDepositSubmit} className="flex flex-col gap-6">
              
              {/* Deposit Method Selectors */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-3">
                  1. SELECT PAYMENT NETWORK
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDepMethod('bank_wire')}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      depMethod === 'bank_wire'
                        ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600 font-semibold'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-transparent'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px]">Bank Wire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepMethod('crypto_usdt')}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      depMethod === 'crypto_usdt'
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-600 font-semibold'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-transparent'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px]">USDT Crypto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepMethod('credit_card')}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      depMethod === 'credit_card'
                        ? 'border-amber-500 bg-amber-50/10 text-amber-600 font-semibold'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-transparent'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px]">Credit Card</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Instructions based on method */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850">
                {depMethod === 'bank_wire' && (
                  <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-400">
                    <span className="font-semibold text-[10px] uppercase font-mono tracking-widest text-indigo-500 block">
                      Autonomous Settlement Instructions
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block">IBAN DESTINATION</span>
                        <span className="font-semibold text-slate-800 dark:text-white">US92 NEXA 0102 3491 88</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">SWIFT/BIC CODE</span>
                        <span className="font-semibold text-slate-800 dark:text-white">NEXABANKUS33</span>
                      </div>
                      <div className="col-span-2 pt-1">
                        <span className="text-[9px] text-slate-400 block">REFERENCE NOTES</span>
                        <span className="font-semibold text-slate-800 dark:text-white">NEXA-DEP-{user.id.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {depMethod === 'crypto_usdt' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-600 dark:text-zinc-400">
                    {/* Compliance QR Reference */}
                    <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
                      <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full opacity-70">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`rounded-sm ${i % 3 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="font-semibold text-[10px] uppercase font-mono tracking-widest text-emerald-500 block">
                        USDT Stablecoin (TRC-20 Network)
                      </span>
                      <p className="text-[11px]">Deploy matching USD amounts to the designated stable wallet below.</p>
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-2 rounded-xl">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-2 rounded-xl">
                            <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-300 truncate">BTC: bc1q3az2amlwrsn4szz3myxehjzf6qxdkhxm9jz4yt</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-2 rounded-xl">
                            <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-300 truncate">ETH/USDT: 0xBd512D38791943164048D14Eb487E47f7C039fe2</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-2 rounded-xl">
                            <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-300 truncate">SOL: Gzd2KNHaWbkSUnZvBtrMZT6oUWvnEFtFLNVo5d9N5WJ7</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {depMethod === 'credit_card' && (
                  <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-400">
                    <span className="font-semibold text-[10px] uppercase font-mono tracking-widest text-amber-500 block">
                      Credit / Debit Card Instant Auth
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-3">
                        <label className="text-[9px] uppercase tracking-wider text-slate-400">Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 8901 2435 6789"
                          disabled
                          className="w-full mt-1 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="08/29"
                          disabled
                          className="w-full mt-1 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-lg text-xs font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400">CVV</label>
                        <input
                          type="text"
                          placeholder="•••"
                          disabled
                          className="w-full mt-1 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-lg text-xs font-mono text-center"
                        />
                      </div>
                      <div className="col-span-3 pt-1">
                        <span className="text-[10px] text-slate-400">
                          *Pre-filled from your registered Platinum Nexa card credentials.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Amount form */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  2. SPECIFY DEPOSIT AMOUNT
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                  <input
                    type="number"
                    placeholder="100.00"
                    value={depAmount}
                    onChange={(e) => {
                      setDepAmount(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition"
                    id="input-deposit-amount"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition font-sans font-semibold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                id="btn-deposit-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Packaging Request...
                  </>
                ) : (
                  <>
                    Authorize Deposit Handshake
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>
        )}

        {/* WITHDRAW COMPONENT */}
        {activeAction === 'withdraw' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative`}>
            
            <AnimatePresence>
              {wthSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl z-20 flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 rounded-full mb-4">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">Withdrawal Request Dispatched!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1.5">
                    Your payout request has been compiled and is awaiting audit clearance from compliance team. Available assets deducted successfully.
                  </p>
                  <button
                    onClick={() => setWthSuccess(false)}
                    className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl font-sans text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-6">
              <h3 className="font-display font-bold text-lg">Instant Asset Withdrawal</h3>
              <p className="text-xs text-slate-500 mt-0.5">Discharge balance ledgers directly into external bank or crypto networks.</p>
            </div>

            {/* Tap Switcher between Crypto Wallet and US Bank Transfer */}
            <div className="flex border-b border-slate-150 dark:border-zinc-800 mb-5">
              <button
                type="button"
                onClick={() => {
                  setWthTab('crypto');
                  setError('');
                }}
                className={`flex-1 py-3 text-center text-xs font-semibold transition border-b-2 ${
                  wthTab === 'crypto'
                    ? 'border-indigo-500 text-indigo-500 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
                id="btn-withdraw-crypto-tab"
              >
                Crypto Wallet
              </button>
              <button
                type="button"
                onClick={() => {
                  setWthTab('us_bank');
                  setError('');
                }}
                className={`flex-1 py-3 text-center text-xs font-semibold transition border-b-2 ${
                  wthTab === 'us_bank'
                    ? 'border-indigo-500 text-indigo-500 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
                id="btn-withdraw-usbank-tab"
              >
                US Bank Transfer
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="flex flex-col gap-5">
              
              {/* Crypto Form Fields */}
              {wthTab === 'crypto' && (
                <div className="space-y-4">
                  {/* Currency Selection Dropdown */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      Active Crypto Currency
                    </label>
                    <select
                      value={cryptoCurrency}
                      onChange={(e) => setCryptoCurrency(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none text-slate-800 dark:text-zinc-200"
                      id="select-crypto-currency"
                    >
                      <option value="USDT">Tether (USDT)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="DOGE">Dogecoin (DOGE)</option>
                    </select>
                  </div>

                  {/* Recipient Wallet Address with validation */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      Recipient Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter external alphanumeric destination address"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      id="input-crypto-address"
                    />
                  </div>

                  {/* Network Selection Dropdown */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      Network Selection
                    </label>
                    <select
                      value={cryptoNetwork}
                      onChange={(e) => setCryptoNetwork(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none text-slate-800 dark:text-zinc-200"
                      id="select-crypto-network"
                    >
                      <option value="TRC-20">TRC-20 (Tron Network - Low Fee)</option>
                      <option value="ERC-20">ERC-20 (Ethereum Mainnet)</option>
                      <option value="Solana">SOL (Solana Ecosystem)</option>
                      <option value="Doge_Native">Doge Native (Dogecoin Blockchain)</option>
                      <option value="BEP-20">BEP-20 (Binance Smart Chain)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* US Bank Form Fields */}
              {wthTab === 'us_bank' && (
                <div className="space-y-4">
                  {/* Searchable/Interactive Major United States Banks Dropdown */}
                  <div className="relative">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      United States Bank Selector
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search or select a major US Bank..."
                        value={selectedBank ? selectedBank : bankSearch}
                        onChange={(e) => {
                          setBankSearch(e.target.value);
                          setSelectedBank(''); // Clear selection if typing
                          setShowBankDropdown(true);
                        }}
                        onFocus={() => setShowBankDropdown(true)}
                        className="w-full p-3 pl-9 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none text-slate-800 dark:text-zinc-200"
                        id="input-bank-search"
                      />
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {showBankDropdown && (
                      <div className="absolute z-30 w-full mt-1.5 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-xl">
                        {filteredBanks.length > 0 ? (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank);
                                setBankSearch(bank);
                                setShowBankDropdown(false);
                                setError('');
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-950 text-xs text-slate-700 dark:text-zinc-300 transition"
                            >
                              {bank}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2.5 text-xs text-slate-400 font-mono text-center">
                            No major United States banks match
                          </div>
                        )}
                      </div>
                    )}
                    {selectedBank && (
                      <span className="text-[9px] font-mono text-emerald-500 block mt-1">
                        ✓ Linked with: <strong>{selectedBank}</strong>
                      </span>
                    )}
                  </div>

                  {/* 9-Digit Routing Number with strict validation */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      9-Digit Routing Number
                    </label>
                    <input
                      type="text"
                      maxLength={9}
                      placeholder="e.g. 021000021"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-mono text-xs focus:outline-none text-slate-800 dark:text-zinc-200"
                      id="input-routing-number"
                    />
                  </div>

                  {/* Account Number with strict validation */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      maxLength={17}
                      placeholder="Enter 4 to 17 digit bank account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-mono text-xs focus:outline-none text-slate-800 dark:text-zinc-200"
                      id="input-account-number"
                    />
                  </div>

                  {/* Account Holder Full Name with validation */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      Account Holder Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter complete legal name matching your account"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none text-slate-800 dark:text-zinc-200"
                      id="input-account-holder-name"
                    />
                  </div>
                </div>
              )}

              {/* Amount form */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  SPECIFY WITHDRAWAL AMOUNT (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                  <input
                    type="number"
                    placeholder="250.00"
                    value={wthAmount}
                    onChange={(e) => {
                      setWthAmount(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition"
                    id="input-withdrawal-amount"
                  />
                </div>
              </div>

              {/* Transparent Fee & Totals Card */}
              {parsedAmount > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-zinc-950 border border-indigo-100/30 dark:border-zinc-850 text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Withdrawal Amount:</span>
                    <span className="font-mono text-slate-700 dark:text-zinc-300">${parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-indigo-500 font-medium">
                    <span>Processing Fee ({wthTab === 'crypto' ? '1.5%' : '0.5%'}):</span>
                    <span className="font-mono">${calculatedFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-100/30 dark:border-zinc-850 pt-2 font-bold text-slate-800 dark:text-white">
                    <span>Aggregate Deduction:</span>
                    <span className="font-mono">${totalDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {/* Withdrawal PIN overlay if required */}
              {user.withdrawalPinRequired && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span className="font-display font-semibold text-[11px] text-amber-500 uppercase tracking-wider">
                      Administrative PIN Security Guard Enforced
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A security policy requires you to input your 4-digit Withdrawal PIN (Your PIN: **{user.withdrawalPin || '4890'}**).
                  </p>
                  <input
                    type="password"
                    placeholder="••••"
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value);
                      setError('');
                    }}
                    maxLength={4}
                    className="w-28 p-2 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 transition tracking-widest text-slate-800 dark:text-white"
                    id="input-withdrawal-pin"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition font-sans font-semibold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                id="btn-withdrawal-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Packaging Handshake Ledger...
                  </>
                ) : (
                  <>
                    Discharge Outbound Funds
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
