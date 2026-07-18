import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, FileText, ArrowRight, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface TaxFilingViewProps {
  user: UserProfile;
  onUpdateUserDetails: (updates: Partial<UserProfile>) => void;
  isDarkMode: boolean;
}

export default function TaxFilingView({ user, onUpdateUserDetails, isDarkMode }: TaxFilingViewProps) {
  const [legalName, setLegalName] = useState(user.taxLegalName || user.name || '');
  const [dob, setDob] = useState(user.taxDob || user.dateOfBirth || '');
  const [filingStatus, setFilingStatus] = useState(user.taxFilingStatus || 'single');
  const [address, setAddress] = useState(user.taxAddress || user.residentialAddress || '');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateUserDetails({
      taxLegalName: legalName,
      taxDob: dob,
      taxFilingStatus: filingStatus,
      taxAddress: address,
      taxSubmitted: true
    });
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

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
              Your structural tax profile data has been securely forwarded to our compliance and reporting department.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold">Annual Tax Filing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Secure structural data collection for financial reporting.</p>
        </div>
      </div>
      
      {user.taxSubmitted && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-400">Information Already on File</h4>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80 mt-1">
              You have previously submitted your tax structural profile. You may update it below if any legal circumstances have changed.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Full Legal Name</label>
            <input
              type="text"
              required
              value={legalName}
              onChange={e => setLegalName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Date of Birth</label>
            <input
              type="date"
              required
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Filing Status</label>
          <select
            value={filingStatus}
            onChange={e => setFilingStatus(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="single">Single</option>
            <option value="married_joint">Married Filing Jointly</option>
            <option value="married_separate">Married Filing Separately</option>
            <option value="head_of_household">Head of Household</option>
            <option value="qualifying_widow">Qualifying Widow(er)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Primary Residential Address</label>
          <textarea
            required
            rows={3}
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="123 Main St, Suite 400..."
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm w-full sm:w-auto flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20"
        >
          {user.taxSubmitted ? 'Update Tax Information' : 'Submit Tax Profile'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
