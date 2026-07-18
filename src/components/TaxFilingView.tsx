import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, FileText, ArrowRight, ArrowLeft, Shield, DollarSign, ToggleLeft, ToggleRight, HelpCircle, Briefcase, TrendingUp, Coins, Loader2, Info, ChevronRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSupabase } from '../lib/supabase';

interface TaxFilingViewProps {
  user: UserProfile;
  onUpdateUserDetails: (updates: Partial<UserProfile>) => void;
  isDarkMode: boolean;
}

const STANDARD_DEDUCTIONS = {
  single: 15000,
  married: 30000,
  head_of_household: 22500
};

export default function TaxFilingView({ user, onUpdateUserDetails, isDarkMode }: TaxFilingViewProps) {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Personal Info Form
  const [legalName, setLegalName] = useState(user.name || '');
  const [dob, setDob] = useState(user.dateOfBirth || '');
  const [address, setAddress] = useState(user.residentialAddress || '');

  // Step 1: Filing Status Selection
  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | 'head_of_household'>('single');

  // Step 2: Income Sources
  const [w2Income, setW2Income] = useState('75000');
  const [interest1099, setInterest1099] = useState('1200');
  const [gains1099, setGains1099] = useState('4500');

  // Step 3: Deduction Configuration
  const [isItemized, setIsItemized] = useState(false);
  const [itemizedAmount, setItemizedAmount] = useState('18500');

  // Live Calculations
  const parseNum = (val: string) => parseFloat(val) || 0;
  const grossIncome = parseNum(w2Income) + parseNum(interest1099) + parseNum(gains1099);
  const selectedDeduction = isItemized 
    ? parseNum(itemizedAmount) 
    : STANDARD_DEDUCTIONS[filingStatus];
  
  const estimatedTaxableIncome = Math.max(0, grossIncome - selectedDeduction);

  // Check if a previously saved tax filing is available inside user's source_funds
  const [parsedTaxDetails, setParsedTaxDetails] = useState<any>(null);

  useEffect(() => {
    if (user.sourceFunds) {
      try {
        const details = JSON.parse(user.sourceFunds);
        if (details && details.taxFilingStatus) {
          setParsedTaxDetails(details);
        }
      } catch (e) {
        // Not a JSON or different content
      }
    }
  }, [user.sourceFunds]);

  const validateStep1 = () => {
    if (!legalName.trim() || legalName.trim().length < 3) {
      setError('Please provide your Full Legal Name.');
      return false;
    }
    if (!dob) {
      setError('Please provide your Date of Birth.');
      return false;
    }
    if (!address.trim() || address.trim().length < 6) {
      setError('Please provide your Primary Residential Address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmitTax = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const taxPayload = {
      taxFilingStatus: 'pending', // 'pending' | 'approved' | 'rejected'
      fullName: legalName,
      dob,
      address,
      status: filingStatus,
      w2Income: parseNum(w2Income),
      interestIncome: parseNum(interest1099),
      cryptoIncome: parseNum(gains1099),
      deductionType: isItemized ? 'itemized' : 'standard',
      deductionAmount: selectedDeduction,
      taxableIncome: estimatedTaxableIncome,
      submittedAt: new Date().toISOString()
    };

    try {
      const supabase = getSupabase();
      
      // Update database profile
      const { error: dbError } = await supabase.from('profiles').update({
        annual_income: estimatedTaxableIncome,
        source_funds: JSON.stringify(taxPayload), // Storing tax filing as JSON
        is_upgraded: true // upgrade flag
      }).eq('id', user.id);

      if (dbError) throw dbError;

      // Update parent react state
      onUpdateUserDetails({
        annualIncome: estimatedTaxableIncome,
        sourceFunds: JSON.stringify(taxPayload),
        isUpgraded: true
      });

      // Add to notifications
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Tax Profile Dispatched',
        message: `Your IRS tax filing profile with taxable income $${estimatedTaxableIncome.toLocaleString()} has been queued for institutional filing.`
      });

      // Add to audit logs
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        actor_name: user.name,
        action: 'Submit Tax Filing',
        target_user_id: user.id,
        target_user_name: user.name,
        details: `User submitted tax structural filing. Status: ${filingStatus.toUpperCase()}, Estimated Taxable: $${estimatedTaxableIncome.toLocaleString()}.`
      });

      setLoading(false);
      setSuccess(true);
      setParsedTaxDetails(taxPayload);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to submit tax documents.');
    }
  };

  // RENDER PENDING / APPROVED REAL-TIME STATUS TRACKER
  if (parsedTaxDetails) {
    return (
      <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} w-full text-left`}>
        <div className="mb-6 flex items-center gap-3 border-b border-slate-150/10 pb-4">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold">Annual Tax Filing</h2>
            <p className="text-[10px] text-slate-400">Institutional IRS electronic filing node system.</p>
          </div>
        </div>

        {/* Real-time Status banner */}
        <div className={`p-5 rounded-2xl border mb-6 flex items-start gap-4 ${
          parsedTaxDetails.taxFilingStatus === 'approved'
            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600'
            : 'bg-amber-500/5 border-amber-500/10 text-amber-500'
        }`}>
          <div className="p-2 bg-white/10 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase font-mono tracking-wider">
              Status: {parsedTaxDetails.taxFilingStatus === 'approved' ? 'Approved & Filed' : 'Verification under review'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {parsedTaxDetails.taxFilingStatus === 'approved'
                ? 'Your electronic tax documents have been processed and approved by the sovereign compliance desk. They are now officially lodged.'
                : 'Your electronic filing package has been registered on the Nexa IRS node. It is currently awaiting validation and signature by institutional administrators.'}
            </p>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="p-5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-150 dark:border-zinc-850 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
            Electronic Submission Audit Trail
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex justify-between sm:justify-start sm:gap-4 border-b border-slate-100/10 pb-1.5">
              <span className="text-slate-400">Legal Name:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">{parsedTaxDetails.fullName}</span>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-4 border-b border-slate-100/10 pb-1.5">
              <span className="text-slate-400">Filing Status:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300 capitalize">{parsedTaxDetails.status}</span>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-4 border-b border-slate-100/10 pb-1.5">
              <span className="text-slate-400">Gross Income:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                ${(parsedTaxDetails.w2Income + parsedTaxDetails.interestIncome + parsedTaxDetails.cryptoIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-4 border-b border-slate-100/10 pb-1.5">
              <span className="text-slate-400">Deduction applied:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                -${parsedTaxDetails.deductionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({parsedTaxDetails.deductionType})
              </span>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-4 border-b border-slate-100/10 pb-1.5 sm:col-span-2">
              <span className="text-slate-400 font-bold">Estimated Taxable Income:</span>
              <span className="font-bold text-indigo-500">
                ${parsedTaxDetails.taxableIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex justify-between pt-1.5 text-[10px] font-mono text-slate-400">
            <span>IRS-NODE HASH REF:</span>
            <span className="font-bold">NEXA-IRS-{(parsedTaxDetails.taxableIncome * 11).toString(16).toUpperCase()}</span>
          </div>
        </div>

        {/* Refile option */}
        <button
          onClick={() => {
            setParsedTaxDetails(null);
            setStep(1);
          }}
          className="mt-6 text-xs text-indigo-500 hover:underline font-semibold font-sans block cursor-pointer"
        >
          Modify & Refile Tax Documents →
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative w-full text-left`}>
      
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl z-20 flex flex-col items-center justify-center text-center p-6"
          >
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-display font-semibold text-lg">Tax Documents Submitted!</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5">
              Your electronic tax package has been successfully queued for IRS node settlement review.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Step tracking */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-150/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold">Annual Tax Filing</h2>
            <p className="text-[11px] text-slate-500">IRS-certified electronic digital filing wizard.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-zinc-950 p-2 rounded-xl border border-slate-200/50 dark:border-zinc-850">
          <span className={step === 1 ? 'text-indigo-500 font-bold' : ''}>1. Legal Profile</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 2 ? 'text-indigo-500 font-bold' : ''}>2. Status & Income</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 3 ? 'text-indigo-500 font-bold' : ''}>3. Deduction</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 4 ? 'text-indigo-500 font-bold' : ''}>4. Calculate</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: LEGAL INFO */}
        {step === 1 && (
          <motion.div
            key="tax-step-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-3 text-xs text-indigo-500">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Prepare your tax profile securely. Details will populate estimated IRS calculations before digital settlement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">Full Legal Name</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={e => {
                    setLegalName(e.target.value);
                    setError('');
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none"
                  placeholder="First and last legal name"
                  id="tax-legal-name"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => {
                    setDob(e.target.value);
                    setError('');
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none text-slate-800 dark:text-zinc-200 font-mono"
                  id="tax-dob"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">Primary Residential Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  setError('');
                }}
                className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none"
                placeholder="123 Main St, Suite 400, New York, NY 10001"
                id="tax-address"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 2: FILING STATUS AND INCOME */}
        {step === 2 && (
          <motion.div
            key="tax-step-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* Filing Status Selector Cards */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2 font-bold">Filing Status</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'single', title: 'Single', desc: 'Individual filer' },
                  { id: 'married', title: 'Married', desc: 'Filing Jointly' },
                  { id: 'head_of_household', title: 'Head of Household', desc: 'With dependents' }
                ].map(status => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => setFilingStatus(status.id as any)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      filingStatus === status.id
                        ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600 font-semibold'
                        : 'border-slate-150 hover:border-slate-200 text-slate-600 dark:text-zinc-400 bg-transparent'
                    }`}
                    id={`btn-tax-status-${status.id}`}
                  >
                    <span className="text-xs font-bold block">{status.title}</span>
                    <span className="text-[9px] text-slate-400 font-sans mt-0.5 block">{status.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Income Numeric Inputs */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Annual Income Portfolios (USD)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* W2 */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-sans flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> W-2 Wages
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={w2Income}
                      onChange={e => setW2Income(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-xs focus:outline-none"
                      id="tax-income-w2"
                    />
                  </div>
                </div>

                {/* 1099-INT */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-sans flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> 1099-INT Interest
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={interest1099}
                      onChange={e => setInterest1099(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-xs focus:outline-none"
                      id="tax-income-interest"
                    />
                  </div>
                </div>

                {/* 1099-B */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-sans flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> 1099-B Crypto/Stock
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={gains1099}
                      onChange={e => setGains1099(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-xs focus:outline-none"
                      id="tax-income-gains"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DEDUCTION TOGGLE */}
        {step === 3 && (
          <motion.div
            key="tax-step-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* Toggle switch */}
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl">
              <div className="space-y-0.5 text-left">
                <span className="text-xs font-bold block text-slate-700 dark:text-zinc-200">Standard vs. Itemized Deductions</span>
                <p className="text-[10px] text-slate-400">Standard applies an IRS flat rate deduction. Itemized lets you set custom totals.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsItemized(!isItemized)}
                className="text-slate-400 hover:text-indigo-500 transition"
                id="btn-tax-toggle-itemized"
              >
                {isItemized ? (
                  <div className="flex items-center gap-2 text-indigo-500 font-semibold text-xs font-sans">
                    Itemized Deductions Active <ToggleRight className="w-10 h-10 text-indigo-500" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-sans">
                    Standard Deduction Active <ToggleLeft className="w-10 h-10" />
                  </div>
                )}
              </button>
            </div>

            {/* Deduction amount display */}
            <AnimatePresence mode="wait">
              {!isItemized ? (
                <motion.div
                  key="standard-amount"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-xs text-left text-slate-600 dark:text-zinc-300 space-y-1"
                >
                  <span className="font-bold text-[10px] uppercase font-mono tracking-widest text-indigo-500 block">Standard IRS Deduction Rate Applied</span>
                  <div className="flex justify-between font-mono pt-1 text-sm text-slate-800 dark:text-white">
                    <span>Filing status allowance:</span>
                    <span className="font-bold">${STANDARD_DEDUCTIONS[filingStatus].toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="itemized-amount"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-1.5 text-left"
                >
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Enter Custom Itemized Deductions</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                    <input
                      type="number"
                      value={itemizedAmount}
                      onChange={e => setItemizedAmount(e.target.value)}
                      className="w-full pl-6 pr-3 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl font-mono text-xs focus:outline-none"
                      id="tax-itemized-amount"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 4: CALCULATION SUMMARY & SUBMIT */}
        {step === 4 && (
          <motion.div
            key="tax-step-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4 text-left"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Estimated IRS Tax filing audit ledger</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Please review the financial calculations compiled automatically from your answers.</p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 font-mono text-xs text-slate-700 dark:text-zinc-300">
              <div className="flex justify-between border-b border-slate-150/10 pb-2">
                <span>Aggregate Gross Income:</span>
                <span className="font-bold">${grossIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-150/10 pb-2">
                <span>Deduction Applied ({isItemized ? 'Itemized' : 'Standard'}):</span>
                <span className="font-bold text-emerald-500">-${selectedDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-slate-900 dark:text-white">
                <span>Estimated Taxable Income:</span>
                <span className="font-bold text-indigo-500">${estimatedTaxableIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              *By clicking submit, you authorize NexaBank to establish digital ledger nodes, sign under penalty of perjury, and dispatch the package to IRS Node verification protocols.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2 text-left">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-150/10">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-sans font-semibold text-xs rounded-xl flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div /> // spacer
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-sans font-semibold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
            id="btn-tax-next"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitTax}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            id="btn-tax-submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing IRS Node...
              </>
            ) : (
              <>
                Submit to IRS Node <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
