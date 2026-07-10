import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

interface AuthScreensProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: signInError } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      if (data.session) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Subtle Background Animation */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #064e3b 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #1e1b4b 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, #064e3b 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 opacity-20"
      />

      <motion.div
        layout
        className="w-full max-w-md bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">NexaBank</h1>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono font-bold mt-1">Sovereign Wealth Custody</p>
        </div>

        <div className="grid grid-cols-2 bg-zinc-950/50 rounded-2xl p-1 mb-6 border border-zinc-800/50">
          <button
            onClick={() => setScreen('login')}
            className={`py-3 text-sm font-semibold rounded-xl transition-all ${screen === 'login' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            LOGIN
          </button>
          <button
            onClick={() => setScreen('register')}
            className={`py-3 text-sm font-semibold rounded-xl transition-all ${screen === 'register' ? 'bg-emerald-900/50 text-emerald-100 shadow-lg' : 'text-zinc-500'}`}
          >
            REGISTER
          </button>
        </div>

        {error && <p className="text-rose-400 text-xs mb-4 p-3 bg-rose-950/20 rounded-xl">{error}</p>}

        <AnimatePresence mode="wait">
          {screen === 'login' && (
            <motion.form 
              key="login"
              onSubmit={handleLogin}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 pl-10 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:ring-1.5 focus:ring-emerald-500/50 transition-all" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 pl-10 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:ring-1.5 focus:ring-emerald-500/50 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-500">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all active:scale-[0.98]">{loading ? '...' : 'LOGIN'}</button>
            </motion.form>
          )}
          {screen === 'register' && (
            <motion.div 
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-zinc-400 text-center py-8"
            >
              Registration is currently in maintenance. Please contact support.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
