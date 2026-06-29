import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Trophy, PiggyBank, Plus, Sparkles, Check } from 'lucide-react';
import { SavingsGoal } from '../types';

interface GoalTrackerProps {
  goal: SavingsGoal;
  onAddFunds: (amount: number) => void;
  checkingBalance: number;
}

export default function GoalTracker({ goal, onAddFunds, checkingBalance }: GoalTrackerProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const isGoalMet = goal.current >= goal.target;

  const handleDeposit = (amount: number) => {
    if (amount <= 0) {
      setDepositError('Specify a positive deposit amount.');
      return;
    }
    if (amount > checkingBalance) {
      setDepositError('Insufficient funds in your checking account.');
      return;
    }
    setDepositError('');
    onAddFunds(amount);
    
    // Trigger fun goal celebration if goal has been newly met!
    if (goal.current + amount >= goal.target && !isGoalMet) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setDepositError('Please enter a valid amount.');
      return;
    }
    handleDeposit(parsed);
    setCustomAmount('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-600/95 flex flex-col items-center justify-center text-center p-6 z-30 text-white"
            id="goal-celebration-overlay"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              className="p-4 bg-white/10 rounded-full border border-white/20 mb-3"
            >
              <Trophy className="w-10 h-10 text-yellow-300 animate-bounce" />
            </motion.div>
            <h3 className="font-display font-semibold text-xl tracking-tight">Goal Achieved!</h3>
            <p className="text-xs text-indigo-100 max-w-xs mt-1">
              You've successfully saved **${goal.target.toLocaleString()}** for **{goal.name}**! Incredible work!
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="mt-4 px-4 py-1.5 bg-white text-indigo-600 rounded-xl font-sans font-medium text-xs hover:bg-indigo-50 transition active:scale-95"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-slate-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-500" />
            Target Savings Vault
          </h3>
          <p className="text-xs text-slate-500">Auto-apportion funds into specific benchmarks.</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-slate-50 text-slate-600 border border-slate-100/50">
          {goal.category}
        </span>
      </div>

      {/* Goal Title */}
      <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 mb-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-medium text-xs text-slate-900">{goal.name}</h4>
            <span className="text-[10px] text-slate-400 font-mono">
              ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()} saved
            </span>
          </div>
        </div>
        
        {isGoalMet ? (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <Check className="w-3 h-3" /> Met
          </span>
        ) : (
          <span className="font-display font-semibold text-sm text-indigo-600">
            {percentage}%
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="mb-5">
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200/50 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:12px_12px] animate-[shimmer_1s_infinite_linear]" />
          </motion.div>
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1.5 font-mono">
          <span>STARTING: $0</span>
          <span>GOAL MET AT ${goal.target.toLocaleString()}</span>
        </div>
      </div>

      {/* Deposit Shortcuts */}
      <div className="flex flex-col gap-3">
        <span className="font-display font-medium text-xs text-slate-700">Allocate Checking Funds</span>
        <div className="grid grid-cols-3 gap-2">
          {([25, 50, 100] as const).map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleDeposit(amt)}
              className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 rounded-xl font-mono text-xs font-semibold tracking-tight transition active:scale-95 flex items-center justify-center gap-1"
              id={`btn-goal-shortcut-${amt}`}
            >
              <Plus className="w-3 h-3 opacity-60" />
              ${amt}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">$</span>
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setDepositError('');
              }}
              className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              id="input-goal-custom-deposit"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-sans font-medium text-xs rounded-xl transition-all border border-slate-950"
            id="btn-goal-custom-deposit-submit"
          >
            Transfer
          </button>
        </form>

        {depositError && (
          <p className="text-[10px] text-rose-500 font-sans mt-0.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-500" />
            {depositError}
          </p>
        )}
      </div>
    </div>
  );
}
