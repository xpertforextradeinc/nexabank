import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, AlertCircle, CheckCircle2, Key, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreensProps {
  onLoginSuccess: (user: UserProfile) => void;
  usersList: UserProfile[];
  onRegisterUser: (name: string, email: string) => void;
}

export default function AuthScreens({ onLoginSuccess, usersList, onRegisterUser }: AuthScreensProps) {
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot' | 'verify' | 'mfa'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAgree, setRegAgree] = useState(false);

  // Auth States
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Login Submit
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your account email address.');
      return;
    }

    // Standard simulated authentication logic
    const foundUser = usersList.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    
    if (!foundUser) {
      setError('Invalid email or password combination. Try "user@nexabank.com" or "admin@nexabank.com"');
      return;
    }

    // For demo purposes, any valid seed account accepts standard matching or "password"
    // Let's check status
    if (foundUser.status === 'suspended') {
      setError('This NexaBank account has been suspended by administration compliance. Please contact support.');
      return;
    }

    // Trigger MFA Screen if mfaEnabled
    if (foundUser.mfaEnabled) {
      setTempUser(foundUser);
      // Generate a mock code for the user
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      foundUser.mfaCode = code; // temporary save
      setScreen('mfa');
      setSuccess(`MFA code generated for simulation: ${code}`);
      return;
    }

    // Success login
    setSuccess('Secure authorization complete. Synchronizing ledger...');
    setTimeout(() => {
      onLoginSuccess(foundUser);
    }, 1200);
  };

  // Handle Registration
  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName || !regEmail) {
      setError('Please provide both your legal name and email address.');
      return;
    }
    if (!regAgree) {
      setError('You must accept the NexaBank Privacy & Electronic Funds Transfer Accord.');
      return;
    }

    const exists = usersList.some((u) => u.email.toLowerCase().trim() === regEmail.toLowerCase().trim());
    if (exists) {
      setError('An account with this email is already registered.');
      return;
    }

    onRegisterUser(regName, regEmail);
    setVerificationEmail(regEmail);
    setScreen('verify');
    setSuccess('Registration received! Directing to account activation verification.');
  };

  // Handle Verification
  const handleVerificationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('Email authenticated! You can now log into your brand new ledger.');
    setTimeout(() => {
      setEmail(verificationEmail);
      setScreen('login');
      setSuccess('');
    }, 1500);
  };

  // Handle MFA Code Verification
  const handleMfaVerify = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!tempUser) return;

    if (mfaCode === tempUser.mfaCode || mfaCode === '123456' || tempUser.email === 'admin@nexabank.com') {
      setSuccess('MFA verification confirmed. Enforcing security handshake...');
      setTimeout(() => {
        onLoginSuccess(tempUser);
      }, 1000);
    } else {
      setError('MFA security verification code is incorrect. Please double check standard generator.');
    }
  };

  // Handle Forgot Password
  const handleForgot = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please specify the email to recover.');
      return;
    }
    setSuccess(`Recovery credentials dispatched to ${email}. Check sandbox mailbox.`);
    setTimeout(() => {
      setScreen('login');
      setSuccess('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/10 selection:text-emerald-400">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Container */}
      <div className="w-full max-w-md z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl mb-3 text-emerald-400 shadow-xl"
          >
            <Shield className="w-8 h-8" />
          </motion.div>
          <h1 className="font-display font-bold text-3xl tracking-tight text-white">NexaBank</h1>
          <p className="text-sm text-zinc-400 mt-1.5 font-sans">
            Next-generation autonomous asset custody & micro-ledgers.
          </p>
        </div>

        {/* Card Panel */}
        <motion.div
          layout
          className="bg-zinc-900 border border-zinc-850 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          id="auth-panel-container"
        >
          {/* Subtle top indicator line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500" />

          <AnimatePresence mode="wait">
            {screen === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="mb-6 text-left">
                  <h2 className="font-display font-bold text-lg text-white">Security Access</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Authorize to synchronize your active balance ledger.</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Ledger Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="user@nexabank.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="login-input-email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Passphrase</label>
                      <button
                        type="button"
                        onClick={() => setScreen('forgot')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-sans"
                        id="btn-goto-forgot"
                      >
                        Reset credentials?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="login-input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 active:scale-95 text-slate-950 font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 mt-2 cursor-pointer"
                    id="btn-login-submit"
                  >
                    Authorize Ledger
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Helper / Demo presets */}
                <div className="mt-6 pt-5 border-t border-zinc-850/50 text-left">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mb-2.5">
                    SANDBOX DEMO ACCOUNTS
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('elitedailyearnings@gmail.com');
                        setPassword('password');
                      }}
                      className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-indigo-500 text-left transition"
                    >
                      <span className="text-indigo-400 block font-semibold text-[9px] uppercase">Regular User</span>
                      <span>elitedailyearnings@gmail.com</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@nexabank.com');
                        setPassword('password');
                      }}
                      className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-emerald-500 text-left transition"
                    >
                      <span className="text-emerald-400 block font-semibold text-[9px] uppercase">Admin Controller</span>
                      <span>admin@nexabank.com</span>
                    </button>
                  </div>
                </div>

                {/* Switch to Register */}
                <div className="mt-5 text-center">
                  <span className="text-xs text-zinc-400 font-sans">
                    New to NexaBank?{' '}
                    <button
                      onClick={() => setScreen('register')}
                      className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline"
                      id="btn-goto-register"
                    >
                      Instantiate micro-wallet
                    </button>
                  </span>
                </div>
              </motion.div>
            )}

            {screen === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="mb-6 text-left">
                  <h2 className="font-display font-bold text-lg text-white">Ledger Initialization</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Launch a brand new client-side secure personal wallet.</p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Full Legal Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="register-input-name"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Email Destination</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="register-input-email"
                      />
                    </div>
                  </div>

                  {/* Accept Accord */}
                  <label className="flex items-start gap-2.5 text-left cursor-pointer py-1 select-none">
                    <input
                      type="checkbox"
                      checked={regAgree}
                      onChange={(e) => {
                        setRegAgree(e.target.checked);
                        setError('');
                      }}
                      className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 mt-0.5 focus:ring-0"
                    />
                    <span className="text-[10px] text-zinc-400 leading-normal">
                      I agree to the electronic deposit, withdrawal & simulated regulatory auditing terms.
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 active:scale-95 text-white font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 mt-2"
                    id="btn-register-submit"
                  >
                    Deploy Personal Ledger
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-5 text-center">
                  <span className="text-xs text-zinc-400 font-sans">
                    Already have a credential?{' '}
                    <button
                      onClick={() => setScreen('login')}
                      className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline"
                    >
                      Authorize here
                    </button>
                  </span>
                </div>
              </motion.div>
            )}

            {screen === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="mb-6 text-left">
                  <h2 className="font-display font-bold text-lg text-white">Credential Dispatch</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Request a simulated reset handshake link to your mailbox.</p>
                </div>

                <form onSubmit={handleForgot} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="your-email@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        id="forgot-input-email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all"
                    id="btn-forgot-submit"
                  >
                    Dispatch Link
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => setScreen('login')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Never mind, return to login
                  </button>
                </div>
              </motion.div>
            )}

            {screen === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="mb-6 text-left">
                  <h2 className="font-display font-bold text-lg text-white">Email Authentication</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    An activation sequence has been generated for **{verificationEmail}**.
                  </p>
                </div>

                <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4">
                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center gap-3">
                    <Mail className="w-5 h-5 text-indigo-400 animate-bounce" />
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Verification Bypass</span>
                      <p className="text-xs font-semibold text-zinc-300">Email auto-approved in Sandbox container.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 active:scale-95 text-slate-950 font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all"
                    id="btn-verify-submit"
                  >
                    Confirm & Activate
                  </button>
                </form>
              </motion.div>
            )}

            {screen === 'mfa' && (
              <motion.div
                key="mfa"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="mb-6 text-left">
                  <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    Two-Factor Handshake
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    An administrative policy enforces multi-factor validation for this profile.
                  </p>
                </div>

                <form onSubmit={handleMfaVerify} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Enter Security Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter code (or see bypass notice above)"
                      value={mfaCode}
                      onChange={(e) => {
                        setMfaCode(e.target.value);
                        setError('');
                      }}
                      className="w-full py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-center text-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-700 tracking-widest"
                      id="mfa-input-code"
                      maxLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 active:scale-95 text-slate-950 font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all"
                    id="btn-mfa-submit"
                  >
                    Verify Passcode
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => setScreen('login')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Abort authentication
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Blocks */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-xl text-left text-xs flex items-start gap-2.5 font-sans"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-xl text-left text-xs flex items-start gap-2.5 font-sans"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Outer security assurance */}
        <div className="text-center mt-6 text-[10px] text-zinc-500 font-mono">
          <span>SECURED WITH ADVANCED LEDGER ENCRYPTION ● VER: 2.15</span>
        </div>

      </div>
    </div>
  );
}
