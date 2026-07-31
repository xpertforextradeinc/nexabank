import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Trophy, PiggyBank, Plus, Sparkles, Check, Loader2, ArrowLeft, ChevronDown } from 'lucide-react';
import { SavingsGoal, UserProfile } from '../types';
import { getSupabase } from '../lib/supabase';

interface GoalTrackerProps {
  goal: SavingsGoal;
  onAddFunds: (amount: number) => void;
  checkingBalance: number;
  isDarkMode?: boolean;
  user?: UserProfile;
}

export default function GoalTracker({ goal: initialGoal, onAddFunds, checkingBalance, isDarkMode, user }: GoalTrackerProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([initialGoal]);
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  
  const [customAmount, setCustomAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const supabase = getSupabase();
  const currentGoal = goals[activeGoalIndex] || goals[0];

  useEffect(() => {
    async function loadGoals() {
      if (!user) return;
      try {
        const { data, error } = await supabase.from('savings_goals').select('*').eq('user_id', user.id);
        if (!error && data && data.length > 0) {
          const loadedGoals = data.map(g => ({
            id: g.id,
            name: g.name,
            target: g.target_amount,
            current: g.current_amount,
            category: 'Custom',
            color: g.color || 'indigo'
          }));
          setGoals([...loadedGoals]);
        }
      } catch (err) {
        console.error('Failed to load goals', err);
      }
    }
    loadGoals();
  }, [user]);

  const percentage = Math.min(100, Math.round((currentGoal.current / currentGoal.target) * 100));
  const isGoalMet = currentGoal.current >= currentGoal.target;

  const handleDeposit = async (amount: number) => {
    if (amount <= 0) {
      setDepositError('Specify a positive deposit amount.');
      return;
    }
    if (amount > checkingBalance) {
      setDepositError('Insufficient funds in your checking account.');
      return;
    }
    setDepositError('');
    onAddFunds(amount); // Deducts from App state wallet

    // Save to supabase
    if (user && currentGoal.id !== 'fallback-id' && !currentGoal.id.startsWith('mock-')) {
      const newAmount = currentGoal.current + amount;
      await supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', currentGoal.id);
    }

    const updatedGoals = [...goals];
    updatedGoals[activeGoalIndex].current += amount;
    setGoals(updatedGoals);
    
    // Trigger fun goal celebration if goal has been newly met!
    if (updatedGoals[activeGoalIndex].current >= updatedGoals[activeGoalIndex].target && !isGoalMet) {
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

  const handleCreateGoal = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const targetAmt = parseFloat(newGoalTarget);
    if (!newGoalName || isNaN(targetAmt) || targetAmt <= 0) {
      setDepositError('Please provide a valid name and target amount.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('savings_goals').insert([{
        user_id: user.id,
        name: newGoalName,
        target_amount: targetAmt,
        current_amount: 0
      }]).select().single();
      
      if (error) throw error;
      
      const newGoal = {
        id: data.id,
        name: data.name,
        target: data.target_amount,
        current: data.current_amount,
        category: 'Custom',
        color: 'indigo'
      };
      
      setGoals([...goals, newGoal]);
      setActiveGoalIndex(goals.length);
      setIsCreating(false);
      setNewGoalName('');
      setNewGoalTarget('');
    } catch (err: any) {
      setDepositError(err.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl p-6 border shadow-sm flex flex-col relative overflow-visible ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-slate-100' : 'bg-white border-slate-100'}`}>
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-600/95 flex flex-col items-center justify-center text-center p-6 z-30 text-white rounded-2xl"
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
              You've successfully saved **${currentGoal.target.toLocaleString()}** for **{currentGoal.name}**! Incredible work!
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
          <h3 className={`font-display font-semibold text-sm flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            <Target className="w-4 h-4 text-indigo-500" />
            Target Savings Vault
          </h3>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Auto-apportion funds into specific benchmarks.</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border flex items-center gap-1 transition ${isDarkMode ? 'bg-zinc-900 text-slate-300 border-zinc-800 hover:bg-zinc-800' : 'bg-slate-50 text-slate-600 border-slate-100/50 hover:bg-slate-100'}`}
          >
            <Plus className="w-3 h-3" /> New Goal
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleCreateGoal} className="flex flex-col gap-3 mb-2 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={() => setIsCreating(false)} className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Create Savings Goal</span>
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Goal Name (e.g. Emergency Fund)"
              value={newGoalName}
              onChange={e => setNewGoalName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-slate-200 placeholder:text-zinc-600' : 'bg-slate-50 border-slate-200/60 placeholder:text-slate-400'}`}
            />
          </div>
          <div>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
              <input 
                type="number" 
                placeholder="Target Amount"
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
                className={`w-full pl-6 pr-3 py-2 border rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-slate-200 placeholder:text-zinc-600' : 'bg-slate-50 border-slate-200/60 placeholder:text-slate-400'}`}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-sans font-medium text-xs transition-all active:scale-95 flex justify-center items-center gap-2 border ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-950'}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
            Create Ledger Entry
          </button>
          {depositError && <p className="text-[10px] text-rose-500 font-sans mt-0.5">{depositError}</p>}
        </form>
      ) : (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col h-full">
          {/* Goal Selector */}
          {goals.length > 1 && (
            <div className="relative mb-3 z-20">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex justify-between items-center px-3 py-2 border rounded-xl text-xs font-medium transition ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-slate-300 hover:bg-zinc-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                <span>{currentGoal.name}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className={`absolute top-full left-0 right-0 mt-1 p-1 border rounded-xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}
                  >
                    {goals.map((g, idx) => (
                      <button 
                        key={g.id}
                        onClick={() => { setActiveGoalIndex(idx); setIsDropdownOpen(false); setDepositError(''); }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${activeGoalIndex === idx ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDarkMode ? 'text-slate-400 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-50')}`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Goal Info Card */}
          <div className={`border rounded-xl p-4 mb-5 flex justify-between items-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800/50' : 'bg-slate-50 border-slate-100/50'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 border rounded-lg ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`font-display font-medium text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{currentGoal.name}</h4>
                <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  ${currentGoal.current.toLocaleString()} of ${currentGoal.target.toLocaleString()} saved
                </span>
              </div>
            </div>
            
            {isGoalMet ? (
              <span className={`flex items-center gap-1 text-[10px] font-mono font-medium px-2.5 py-1 rounded-full ${isDarkMode ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'}`}>
                <Check className="w-3 h-3" /> Met
              </span>
            ) : (
              <span className="font-display font-semibold text-sm text-indigo-500">
                {percentage}%
              </span>
            )}
          </div>

          {/* Progress Bar Container */}
          <div className="mb-5">
            <div className={`w-full rounded-full h-3.5 p-0.5 border relative overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200/50'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:12px_12px] animate-[shimmer_1s_infinite_linear]" />
              </motion.div>
            </div>
            <div className={`flex justify-between text-[9px] mt-1.5 font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
              <span>STARTING: $0</span>
              <span>GOAL MET AT ${currentGoal.target.toLocaleString()}</span>
            </div>
          </div>

          {/* Deposit Shortcuts */}
          <div className="flex flex-col gap-3 mt-auto">
            <span className={`font-display font-medium text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Allocate Checking Funds</span>
            <div className="grid grid-cols-3 gap-2">
              {([25, 50, 100] as const).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleDeposit(amt)}
                  className={`py-2 border rounded-xl font-mono text-xs font-semibold tracking-tight transition active:scale-95 flex items-center justify-center gap-1 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-slate-300 hover:bg-zinc-800' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'}`}
                >
                  <Plus className="w-3 h-3 opacity-60" />
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setDepositError('');
                  }}
                  className={`w-full pl-6 pr-3 py-2 border rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isDarkMode ? 'bg-zinc-950 border-zinc-800 text-slate-200 placeholder:text-zinc-600' : 'bg-slate-50 border-slate-200/60 placeholder:text-slate-400'}`}
                />
              </div>
              <button
                type="submit"
                className={`px-4 py-2 border rounded-xl font-sans font-medium text-xs transition-all active:scale-95 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-slate-200 hover:bg-zinc-800' : 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800'}`}
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
      )}
    </div>
  );
}
