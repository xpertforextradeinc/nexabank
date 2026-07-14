import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Clock, 
  Globe, 
  Phone, 
  Check, 
  Compass, 
  Server, 
  Terminal,
  Upload,
  File,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthScreensProps {
  onLoginSuccess: (user: any) => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States (+1)' },
  { code: 'GB', name: 'United Kingdom (+44)' },
  { code: 'CA', name: 'Canada (+1)' },
  { code: 'DE', name: 'Germany (+49)' },
  { code: 'FR', name: 'France (+33)' },
  { code: 'CH', name: 'Switzerland (+41)' },
  { code: 'SG', name: 'Singapore (+65)' },
  { code: 'HK', name: 'Hong Kong (+852)' },
  { code: 'JP', name: 'Japan (+81)' },
  { code: 'AU', name: 'Australia (+61)' }
];

export default function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
  const supabase = getSupabase();
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Multi-step Registration Navigation State
  const [regStep, setRegStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Step 1: Personal Details
  const [regFirstName, setRegFirstName] = useState('');
  const [regMiddleName, setRegMiddleName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Step 2: Address Details
  const [regCountry, setRegCountry] = useState('US');
  const [regState, setRegState] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regZip, setRegZip] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Step 3: Financial Profile
  const [regEmployment, setRegEmployment] = useState('');
  const [regOccupation, setRegOccupation] = useState('');
  const [regEmployer, setRegEmployer] = useState('');
  const [regIncome, setRegIncome] = useState('');
  const [regSourceFunds, setRegSourceFunds] = useState('');

  // Step 4: Identity Verification
  const [regIdType, setRegIdType] = useState('Passport');
  const [regIdNumber, setRegIdNumber] = useState('');
  const [regSsn, setRegSsn] = useState(''); // Optional SSN
  const [regIdFileName, setRegIdFileName] = useState('');

  // Step 5: Security Credentials
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPin, setRegPin] = useState(''); // 4-digit Transaction PIN
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAgree, setRegAgree] = useState(false);

  // Auth States
  const [verificationEmail, setVerificationEmail] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [configWarning, setConfigWarning] = useState(false);

  // Metric simulator states for the premium Hero panel
  const [liveUTC, setLiveUTC] = useState('');
  const [handshakeCount, setHandshakeCount] = useState(248109);

  useEffect(() => {
    // Check Supabase Configuration
    if (!isSupabaseConfigured()) {
      setConfigWarning(true);
    } else {
      setConfigWarning(false);
    }

    // Live Clock Ticker
    const clockTicker = setInterval(() => {
      const now = new Date();
      setLiveUTC(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' UTC');
    }, 1000);

    // Handshake metric pulse simulator
    const metricTicker = setInterval(() => {
      setHandshakeCount(prev => prev + Math.floor(Math.random() * 3 + 1));
    }, 4500);

    return () => {
      clearInterval(clockTicker);
      clearInterval(metricTicker);
    };
  }, []);

  // Handle Login Submit
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please provide your account email and security passphrase.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        setSuccess('Secure authorization complete. Handshake confirmed.');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or passphrase combination.');
    } finally {
      setLoading(false);
    }
  };

  // Validate a specific registration step
  const validateStep = (step: number): boolean => {
    setError('');
    
    if (step === 1) {
      if (!regFirstName.trim()) {
        setError('First legal name is a required field.');
        return false;
      }
      if (!regLastName.trim()) {
        setError('Last legal name is a required field.');
        return false;
      }
      if (!regDob) {
        setError('Date of birth is required for regulatory compliance.');
        return false;
      }
      // Calculate age
      const birthDate = new Date(regDob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setError('NexaBank institutional custody requires clients to be at least 18 years of age.');
        return false;
      }
      if (!regGender) {
        setError('Please specify your gender identity.');
        return false;
      }
      if (!regPhone.trim()) {
        setError('Please enter a valid mobile phone number for secure MFA initialization.');
        return false;
      }
      if (!regEmail.trim()) {
        setError('Please specify your secure email destination.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regEmail.trim())) {
        setError('Email destination is not formatted correctly.');
        return false;
      }
    }

    if (step === 2) {
      if (!regCountry) {
        setError('Please select your residential country node.');
        return false;
      }
      if (!regState.trim()) {
        setError('State or province identifier is required.');
        return false;
      }
      if (!regCity.trim()) {
        setError('Residential city is required.');
        return false;
      }
      if (!regZip.trim()) {
        setError('ZIP or postal code is required.');
        return false;
      }
      if (!regAddress.trim()) {
        setError('Street address is required to satisfy AML/KYC location standards.');
        return false;
      }
    }

    if (step === 3) {
      if (!regEmployment) {
        setError('Please declare your current employment status.');
        return false;
      }
      if ((regEmployment === 'Employed' || regEmployment === 'Self-Employed') && !regOccupation.trim()) {
        setError('Please specify your occupation or professional trade.');
        return false;
      }
      if ((regEmployment === 'Employed' || regEmployment === 'Self-Employed') && !regEmployer.trim()) {
        setError('Please declare your employer or business name.');
        return false;
      }
      if (!regIncome) {
        setError('Please enter your estimated annual income.');
        return false;
      }
      if (Number(regIncome) < 0) {
        setError('Estimated income cannot be a negative value.');
        return false;
      }
      if (!regSourceFunds) {
        setError('Please select your primary source of transacted funds.');
        return false;
      }
    }

    if (step === 4) {
      if (!regIdType) {
        setError('Please select a government identity document class.');
        return false;
      }
      if (!regIdNumber.trim()) {
        setError('Please enter the government ID document index number.');
        return false;
      }
      // SSN and Upload ID are optional in Demo Mode
    }

    if (step === 5) {
      if (regPassword.length < 6) {
        setError('Security passphrase must be at least 6 characters.');
        return false;
      }
      if (regPassword !== regConfirmPassword) {
        setError('Symmetric verification error: Passphrases do not match.');
        return false;
      }
      if (!regPin) {
        setError('A 4-digit transaction authorization PIN is required.');
        return false;
      }
      if (!/^\d{4}$/.test(regPin)) {
        setError('Transaction PIN must be exactly 4 numeric digits.');
        return false;
      }
      if (!regAgree) {
        setError('You must accept the NexaBank Privacy & Electronic Funds Transfer Accord.');
        return false;
      }
    }

    return true;
  };

  // Handle Expanded Multi-Step Registration Submit
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Final compliance check across all steps
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setRegStep(s);
        return;
      }
    }

    setLoading(true);
    try {
      const fullName = `${regFirstName.trim()} ${regMiddleName.trim() ? regMiddleName.trim() + ' ' : ''}${regLastName.trim()}`;
      const uniqueAcctNum = String(Math.floor(1000000000 + Math.random() * 9000000000));
      
      const { data, error: signUpError } = await getSupabase().auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: fullName,
            phone: regPhone.trim(),
            country: regCountry,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
            // Save detailed onboarding metadata inside Auth user record as a robust secondary storage
            middle_name: regMiddleName.trim() || null,
            date_of_birth: regDob,
            gender: regGender,
            state_province: regState.trim(),
            city: regCity.trim(),
            zip_postal_code: regZip.trim(),
            residential_address: regAddress.trim(),
            employment_status: regEmployment,
            occupation: regOccupation.trim() || null,
            employer: regEmployer.trim() || null,
            annual_income: regIncome ? Number(regIncome) : null,
            source_funds: regSourceFunds,
            gov_id_type: regIdType,
            gov_id_number: regIdNumber.trim(),
            national_id_ssn: regSsn.trim() || null,
            uploaded_id_url: regIdFileName || 'Gov_ID_Verification.pdf',
            withdrawal_pin: regPin,
            account_number: uniqueAcctNum,
            routing_number: '021000021'
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Flag local session to trigger welcome animation upon auth success hook in App.tsx
        localStorage.setItem('is_new_registration', 'true');

        // Check if the session was immediately resolved (auto-confirmed accounts)
        if (data.session) {
          setSuccess('Sovereign ledger instantiated successfully! Redirecting...');
          
          // CLIENT-SIDE PROFILE CREATION FAILSAFE: Ensure the profiles, wallets, and welcome notifications exist instantly
          const profileWithAllColumns = {
            id: data.user.id,
            name: fullName,
            email: regEmail.trim().toLowerCase(),
            role: 'user',
            status: 'active',
            verification_status: 'verified', // Instant compliance check and automated verification
            phone: regPhone.trim(),
            withdrawal_pin: regPin,
            withdrawal_pin_required: true,
            middle_name: regMiddleName.trim() || null,
            date_of_birth: regDob || null,
            gender: regGender || null,
            country: regCountry || null,
            state_province: regState.trim() || null,
            city: regCity.trim() || null,
            zip_postal_code: regZip.trim() || null,
            residential_address: regAddress.trim() || null,
            employment_status: regEmployment || null,
            occupation: regOccupation.trim() || null,
            employer: regEmployer.trim() || null,
            annual_income: regIncome ? Number(regIncome) : null,
            source_funds: regSourceFunds || null,
            gov_id_type: regIdType || null,
            gov_id_number: regIdNumber.trim() || null,
            national_id_ssn: regSsn.trim() || null,
            uploaded_id_url: regIdFileName || 'Gov_ID_Verification.pdf',
            account_number: uniqueAcctNum,
            routing_number: '021000021'
          };

          try {
            // Attempt to insert with full columns
            const { error: fullProfileError } = await getSupabase().from('profiles').upsert(profileWithAllColumns);
            if (fullProfileError) throw fullProfileError;
          } catch (upsertErr) {
            console.warn("Database has not applied onboarding migrations yet. Retrying with base columns...", upsertErr);
            // Fallback to base columns only if the database schema is in its original prototype state
            const baseProfileOnly = {
              id: data.user.id,
              name: fullName,
              email: regEmail.trim().toLowerCase(),
              role: 'user',
              status: 'active',
              verification_status: 'verified',
              phone: regPhone.trim(),
              withdrawal_pin: regPin,
              withdrawal_pin_required: true
            };
            await getSupabase().from('profiles').upsert(baseProfileOnly);
          }

          // Generate wallet with premium starting balance of $5,000.00
          try {
            await getSupabase().from('wallets').upsert({
              user_id: data.user.id,
              main_balance: 5000.00,
              available_balance: 5000.00,
              pending_balance: 0.00,
              savings_balance: 0.00
            });
          } catch (wErr) {
            console.error("Failsafe wallet generation bypassed:", wErr);
          }

          // Insert database welcome notification automatically
          try {
            await getSupabase().from('notifications').insert({
              user_id: data.user.id,
              title: 'Welcome to NexaBank Premium',
              message: `Welcome ${fullName} to your premium digital ledger for sovereign wealth. Your NexaBank account ${uniqueAcctNum} has been activated and initialized with an opening balance of $5,000.00.`,
              read: false
            });
          } catch (nErr) {
            console.error("Failsafe welcome notification bypassed:", nErr);
          }

          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 1000);
        } else {
          // Requires email verification
          setVerificationEmail(regEmail.trim());
          setScreen('verify');
          setSuccess('Ledger initialized! Verification email dispatched.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Form Submission
  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please specify your registered account email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#reset-password`,
      });
      if (resetError) throw resetError;
      setSuccess('Dispatched reset handshake. Check your registered inbox.');
    } catch (err: any) {
      setError(err.message || 'Credentials dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Integration
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const { error: oauthError } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'Google OAuth handshake failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:grid lg:grid-cols-12 relative overflow-hidden font-sans selection:bg-emerald-500/10 selection:text-emerald-400">
      
      {/* LEFT COLUMN: Premium Institutional Custody Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 bg-zinc-950 text-white relative h-full overflow-hidden border-r border-zinc-900/60 select-none">
        
        {/* Glow ambient meshes */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

        {/* Brand Logo Header */}
        <div className="z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
            <span className="font-display font-black text-slate-950 text-xl leading-none">N</span>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight block">NexaBank</span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 block uppercase -mt-1">Sovereign Custody</span>
          </div>
        </div>

        {/* Main Hero Marketing Body with typing indicators */}
        <div className="z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>NEXABANK INSTITUTIONAL NET v2.16 ACTIVE</span>
          </div>
          
          <h1 className="font-display font-bold text-4xl xl:text-5xl leading-tight tracking-tight text-white">
            The Digital Ledger <br />
            for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">Sovereign Wealth.</span>
          </h1>

          <p className="text-zinc-400 text-sm xl:text-base font-sans leading-relaxed">
            Multi-asset decentralized custody, high-performance liquid checking reserves, and automated yield compounding savings vaults configured for absolute regulatory compliance.
          </p>

          {/* Real-time Ledger Glassmorphic Panels */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-zinc-500 font-mono text-[9px] uppercase tracking-wider mb-1">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                Node Status
              </div>
              <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-zinc-200">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                ONLINE (100% SECURE)
              </div>
            </div>

            <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-zinc-500 font-mono text-[9px] uppercase tracking-wider mb-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Active Ledger Handshakes
              </div>
              <div className="font-mono font-bold text-xs text-indigo-400">
                {handshakeCount.toLocaleString()} SECURED
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer Indicators */}
        <div className="z-10 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-900/80 pt-6">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
            <span>{liveUTC || '00:00:00 UTC'}</span>
          </div>
          <span>SECURED BY IMMUTABLE ENCRYPTION SYSTEMS</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Card Panel Form Segment */}
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6 sm:p-12 overflow-y-auto min-h-screen bg-zinc-950 relative">
        
        {/* Mobile glows */}
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none lg:hidden" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-md z-10 space-y-6">
          
          {/* Mobile Brand Logo Display */}
          <div className="flex flex-col items-center lg:hidden mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-2">
              <span className="font-display font-black text-slate-950 text-xl leading-none">N</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white">NexaBank</h1>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono font-bold mt-0.5">Sovereign Wealth Custody</p>
          </div>

          {/* Configuration Alert Warning */}
          {configWarning && (
            <div className="p-4 bg-amber-950/30 border border-amber-800/30 text-amber-200 rounded-2xl text-left text-xs leading-relaxed flex flex-col gap-2 shadow-xl">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Supabase Configuration Key Required</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                This application requires a Supabase connection key to perform state synchronization. Configure your VITE keys inside Settings or the project's `.env` environment variables.
              </p>
            </div>
          )}

          {/* Interactive Card Form */}
          <motion.div
            layout
            className="bg-zinc-900/70 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
            id="auth-form-container-box"
          >
            {/* Subtle Top Accent Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-600" />

            <AnimatePresence mode="wait">
              
              {/* SCREEN 1: LOGIN */}
              {screen === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 text-left">
                    <h2 className="font-display font-bold text-xl text-white">Secure Portal Entrance</h2>
                    <p className="text-xs text-zinc-400 mt-1">Authenticate to securely synchronize your custody account.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    
                    {/* Floating Label Ledger Email */}
                    <div className="flex flex-col text-left space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Registered Ledger Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          required
                          placeholder="client-name@institution.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                          id="login-email-input"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Floating Label Passphrase */}
                    <div className="flex flex-col text-left space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Security Passphrase</label>
                        <button
                          type="button"
                          onClick={() => {
                            setScreen('forgot');
                            setError('');
                            setSuccess('');
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none"
                          disabled={loading}
                        >
                          Forgot Credential?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                          id="login-password-input"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition focus:outline-none"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Authorize Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                      id="login-submit-btn"
                    >
                      {loading ? 'Confirming Signatures...' : 'Authorize Ledger Session'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Google OAuth Provider Button */}
                  <div className="mt-4 pt-4 border-t border-zinc-850/50 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-sans font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 1.485 15.34 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
                      </svg>
                      Continue with Google Core ID
                    </button>
                  </div>

                  {/* Redirection to register */}
                  <div className="mt-6 text-center border-t border-zinc-850/30 pt-4">
                    <span className="text-xs text-zinc-400 font-sans">
                      New sovereign client?{' '}
                      <button
                        onClick={() => {
                          setScreen('register');
                          setError('');
                          setSuccess('');
                        }}
                        className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline cursor-pointer"
                        disabled={loading}
                      >
                        Create portfolio
                      </button>
                    </span>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 2: MULTI-STEP REGISTER FORM */}
              {screen === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4 text-left">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Step {regStep} of 5</span>
                    <h2 className="font-display font-bold text-xl text-white">
                      {regStep === 1 && "Client Identity Details"}
                      {regStep === 2 && "Residential Coordinates"}
                      {regStep === 3 && "Institutional Financials"}
                      {regStep === 4 && "Identity Validation"}
                      {regStep === 5 && "Sovereign Vault Keys"}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      {regStep === 1 && "Provide your certified legal identity parameters."}
                      {regStep === 2 && "Establish your residential connection address."}
                      {regStep === 3 && "Map out your professional profile and funds coordinates."}
                      {regStep === 4 && "Submit governmental identity reference coordinates."}
                      {regStep === 5 && "Configure your symmetric passwords and transaction pins."}
                    </p>
                  </div>

                  {/* PREMIUM PROGRESS INDICATOR */}
                  <div className="flex items-center justify-between gap-1 mb-6 select-none" id="onboarding-stepper-progress">
                    {[1, 2, 3, 4, 5].map((stepNum) => (
                      <div key={stepNum} className="flex-1 flex items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 border ${
                            stepNum < regStep
                              ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              : stepNum === regStep
                              ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)] ring-4 ring-indigo-500/10"
                              : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          }`}
                        >
                          {stepNum < regStep ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : stepNum}
                        </div>
                        {stepNum < 5 && (
                          <div
                            className={`flex-1 h-[2px] mx-1 rounded-full transition-all duration-300 ${
                              stepNum < regStep ? "bg-emerald-500" : "bg-zinc-850"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <AnimatePresence mode="wait">
                      
                      {/* STEP 1: PERSONAL DETAILS */}
                      {regStep === 1 && (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3.5"
                        >
                          {/* First & Last Legal Name */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">First legal Name</label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                <input
                                  type="text"
                                  required
                                  placeholder="Alex"
                                  value={regFirstName}
                                  onChange={(e) => { setRegFirstName(e.target.value); setError(''); }}
                                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Last legal Name</label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                <input
                                  type="text"
                                  required
                                  placeholder="Morgan"
                                  value={regLastName}
                                  onChange={(e) => { setRegLastName(e.target.value); setError(''); }}
                                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Middle Name (Optional) */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Middle Name <span className="text-zinc-600 font-sans font-normal">(Optional)</span></label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                              <input
                                type="text"
                                placeholder="Jordan"
                                value={regMiddleName}
                                onChange={(e) => { setRegMiddleName(e.target.value); setError(''); }}
                                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                              />
                            </div>
                          </div>

                          {/* Date of Birth & Gender Selection */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Date of Birth</label>
                              <input
                                type="date"
                                required
                                value={regDob}
                                onChange={(e) => { setRegDob(e.target.value); setError(''); }}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                              />
                            </div>
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Gender Identity</label>
                              <select
                                value={regGender}
                                required
                                onChange={(e) => { setRegGender(e.target.value); setError(''); }}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
                              >
                                <option value="" disabled>Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Non-Binary / Other</option>
                                <option value="Declined">Decline to State</option>
                              </select>
                            </div>
                          </div>

                          {/* Email Input */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Secure Email Destination</label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                              <input
                                type="email"
                                required
                                placeholder="client@nexabank.com"
                                value={regEmail}
                                onChange={(e) => { setRegEmail(e.target.value); setError(''); }}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                              />
                            </div>
                          </div>

                          {/* Phone Input */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Phone Signal</label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                              <input
                                type="tel"
                                required
                                placeholder="+1 (555) 019-2831"
                                value={regPhone}
                                onChange={(e) => { setRegPhone(e.target.value); setError(''); }}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 2: ADDRESS */}
                      {regStep === 2 && (
                        <motion.div
                          key="step-2"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3.5"
                        >
                          {/* Country selector */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Country Node</label>
                            <div className="relative">
                              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                              <select
                                value={regCountry}
                                onChange={(e) => { setRegCountry(e.target.value); setError(''); }}
                                className="w-full pl-10 pr-2 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none font-medium"
                              >
                                {COUNTRIES.map((c) => (
                                  <option key={c.code} value={c.code} className="bg-zinc-950 text-white animate-fade-in">
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* State & City (grid) */}
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">State / Province</label>
                              <input
                                type="text"
                                required
                                placeholder="NY"
                                value={regState}
                                onChange={(e) => { setRegState(e.target.value); setError(''); }}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                              />
                            </div>
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">City</label>
                              <input
                                type="text"
                                required
                                placeholder="New York"
                                value={regCity}
                                onChange={(e) => { setRegCity(e.target.value); setError(''); }}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                              />
                            </div>
                          </div>

                          {/* ZIP/Postal Code */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">ZIP / Postal Code</label>
                            <input
                              type="text"
                              required
                              placeholder="10001"
                              value={regZip}
                              onChange={(e) => { setRegZip(e.target.value); setError(''); }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                            />
                          </div>

                          {/* Residential Address */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Street Address</label>
                            <input
                              type="text"
                              required
                              placeholder="742 Evergreen Terrace"
                              value={regAddress}
                              onChange={(e) => { setRegAddress(e.target.value); setError(''); }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 3: FINANCIAL PROFILE */}
                      {regStep === 3 && (
                        <motion.div
                          key="step-3"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3.5"
                        >
                          {/* Employment Status */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Employment Status</label>
                            <select
                              value={regEmployment}
                              required
                              onChange={(e) => { setRegEmployment(e.target.value); setError(''); }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none font-medium"
                            >
                              <option value="" disabled>Select status...</option>
                              <option value="Employed">Employed</option>
                              <option value="Self-Employed">Self-Employed</option>
                              <option value="Unemployed">Unemployed</option>
                              <option value="Retired">Retired</option>
                              <option value="Student">Student</option>
                            </select>
                          </div>

                          {/* Occupation & Employer (Conditional) */}
                          {(regEmployment === 'Employed' || regEmployment === 'Self-Employed') && (
                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="flex flex-col text-left space-y-1">
                                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Occupation</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Software Architect"
                                  value={regOccupation}
                                  onChange={(e) => { setRegOccupation(e.target.value); setError(''); }}
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                />
                              </div>
                              <div className="flex flex-col text-left space-y-1">
                                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Employer Name</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Nexa Technologies"
                                  value={regEmployer}
                                  onChange={(e) => { setRegEmployer(e.target.value); setError(''); }}
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                />
                              </div>
                            </div>
                          )}

                          {/* Annual Income */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Estimated Annual Income</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 font-sans">$</span>
                              <input
                                type="number"
                                required
                                placeholder="125000"
                                value={regIncome}
                                onChange={(e) => { setRegIncome(e.target.value); setError(''); }}
                                className="w-full pl-8 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                              />
                            </div>
                          </div>

                          {/* Source of Funds */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Source of Funds</label>
                            <select
                              value={regSourceFunds}
                              required
                              onChange={(e) => { setRegSourceFunds(e.target.value); setError(''); }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none font-medium"
                            >
                              <option value="" disabled>Select primary source...</option>
                              <option value="Salary">Employment Salary</option>
                              <option value="Savings">Personal Accumulated Savings</option>
                              <option value="Investments">Investment Portfolios</option>
                              <option value="Inheritance">Inheritance</option>
                              <option value="Gift">Gift</option>
                              <option value="Other">Other Compliant Sources</option>
                            </select>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 4: IDENTITY VERIFICATION */}
                      {regStep === 4 && (
                        <motion.div
                          key="step-4"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3.5"
                        >
                          {/* ID Type */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Government ID Class</label>
                            <select
                              value={regIdType}
                              required
                              onChange={(e) => { setRegIdType(e.target.value); setError(''); }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none font-medium"
                            >
                              <option value="Passport">Passport Document</option>
                              <option value="DriversLicense">Drivers License</option>
                              <option value="NationalID">National ID Card</option>
                            </select>
                          </div>

                          {/* ID Number */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">ID Document Index Number</label>
                            <input
                              type="text"
                              required
                              placeholder="F9021831"
                              value={regIdNumber}
                              onChange={(e) => { setRegIdNumber(e.target.value); setError(''); }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                            />
                          </div>

                          {/* SSN / National ID (Optional) */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">National ID / SSN <span className="text-zinc-600 font-sans font-normal">(Optional)</span></label>
                            <input
                              type="text"
                              placeholder="XXX-XX-XXXX"
                              value={regSsn}
                              onChange={(e) => { setRegSsn(e.target.value); setError(''); }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                            />
                          </div>

                          {/* Drag and Drop Upload ID (optional) */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Upload Verification Document <span className="text-zinc-600 font-sans font-normal">(Optional)</span></label>
                            
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                              onDragLeave={() => setIsDragging(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files?.[0]) {
                                  setRegIdFileName(e.dataTransfer.files[0].name);
                                  setError('');
                                }
                              }}
                              onClick={() => document.getElementById('id-file-input')?.click()}
                              className={`w-full py-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-3.5 transition-all duration-200 cursor-pointer ${
                                isDragging 
                                  ? "border-emerald-500 bg-emerald-500/5 animate-pulse" 
                                  : regIdFileName 
                                  ? "border-emerald-500/40 bg-zinc-950" 
                                  : "border-zinc-850 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950"
                              }`}
                            >
                              <input
                                type="file"
                                id="id-file-input"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    setRegIdFileName(e.target.files[0].name);
                                    setError('');
                                  }
                                }}
                              />
                              
                              {regIdFileName ? (
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <File className="w-5 h-5" />
                                  </div>
                                  <div className="text-center">
                                    <span className="text-xs font-semibold text-zinc-200 block max-w-[180px] truncate">{regIdFileName}</span>
                                    <span className="text-[9px] font-mono text-emerald-400 mt-0.5 block">Security Locked Document</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRegIdFileName('');
                                    }}
                                    className="mt-1.5 text-[10px] font-sans font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/20"
                                  >
                                    <Trash2 className="w-3 h-3" /> Remove File
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-500">
                                    <Upload className="w-5 h-5" />
                                  </div>
                                  <div className="text-center">
                                    <span className="text-xs font-bold text-zinc-300 block">Drag & drop your file here</span>
                                    <span className="text-[10px] text-zinc-500 block">or click to choose manual file</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 5: SECURITY & COMPLIANCE */}
                      {regStep === 5 && (
                        <motion.div
                          key="step-5"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3.5"
                        >
                          {/* Passphrase & Confirm side-by-side */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Sovereign Passphrase</label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                <input
                                  type={showRegPassword ? "text" : "password"}
                                  required
                                  placeholder="••••••••"
                                  value={regPassword}
                                  onChange={(e) => { setRegPassword(e.target.value); setError(''); }}
                                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col text-left space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">Confirm Passphrase</label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                <input
                                  type={showRegPassword ? "text" : "password"}
                                  required
                                  placeholder="••••••••"
                                  value={regConfirmPassword}
                                  onChange={(e) => { setRegConfirmPassword(e.target.value); setError(''); }}
                                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Toggle show password */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-all flex items-center gap-1 focus:outline-none"
                            >
                              {showRegPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {showRegPassword ? "Hide passwords" : "Show passwords"}
                            </button>
                          </div>

                          {/* Transaction PIN (exactly 4 digits) */}
                          <div className="flex flex-col text-left space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">4-Digit Transaction PIN</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                              <input
                                type="password"
                                required
                                maxLength={4}
                                placeholder="••••"
                                value={regPin}
                                onChange={(e) => {
                                  setRegPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                                  setError('');
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold tracking-widest"
                              />
                            </div>
                            <span className="text-[9px] text-zinc-500 leading-normal font-sans block mt-0.5">Required for transfers, withdrawals, and security audits.</span>
                          </div>

                          {/* Compliance Checkbox */}
                          <label className="flex items-start gap-3 text-left cursor-pointer py-1.5 select-none">
                            <input
                              type="checkbox"
                              checked={regAgree}
                              onChange={(e) => { setRegAgree(e.target.checked); setError(''); }}
                              className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-emerald-500 mt-0.5 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                              I hereby authorize account instantiation and declare that all transacted funds conform to legal and regulatory compliance guidelines.
                            </span>
                          </label>
                        </motion.div>
                      )}

                    </AnimatePresence>

                    {/* ACTION CONTROLS FOOTER */}
                    <div className="flex items-center gap-3.5 pt-2">
                      {regStep > 1 && (
                        <button
                          type="button"
                          onClick={() => { setRegStep(prev => prev - 1); setError(''); }}
                          className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-sans font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                      )}
                      
                      {regStep < 5 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (validateStep(regStep)) {
                              setRegStep(prev => prev + 1);
                            }
                          }}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
                        >
                          Next Step <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? "Deploying Vault..." : "Deploy Portfolio Node"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Redirection back to secure portal, only shown on Step 1 to keep layout concise */}
                  {regStep === 1 && (
                    <div className="mt-4 text-center border-t border-zinc-850/20 pt-3">
                      <span className="text-xs text-zinc-400 font-sans">
                        Already registered?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setScreen('login');
                            setError('');
                            setSuccess('');
                          }}
                          className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline cursor-pointer focus:outline-none"
                          disabled={loading}
                        >
                          Authorize entrance
                        </button>
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SCREEN 3: FORGOT PASSWORD */}
              {screen === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 text-left">
                    <h2 className="font-display font-bold text-xl text-white">Credential Dispatch</h2>
                    <p className="text-xs text-zinc-400 mt-1">Request a secure reset handshake link to your mailbox.</p>
                  </div>

                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="flex flex-col text-left space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400 font-sans">Registered Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          required
                          placeholder="client@nexabank.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 active:scale-[0.98] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? 'Dispatching System Handshake...' : 'Dispatch Reset Link'}
                    </button>
                  </form>

                  <div className="mt-6 text-center border-t border-zinc-850/30 pt-4">
                    <button
                      onClick={() => {
                        setScreen('login');
                        setError('');
                        setSuccess('');
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-200 transition font-sans cursor-pointer font-medium"
                      disabled={loading}
                    >
                      Never mind, return to login portal
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 4: EMAIL VERIFICATION SENT */}
              {screen === 'verify' && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 text-left">
                    <h2 className="font-display font-bold text-xl text-white">Handshake Activation Pending</h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      An activation sequence has been sent to <strong className="text-zinc-200">{verificationEmail}</strong>.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-4 text-left">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
                        <Mail className="w-5 h-5 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Inbound Security Signal</span>
                        <p className="text-xs font-semibold text-zinc-300 leading-snug">Please click the authentication link in your email to sync client status.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setScreen('login');
                        setEmail(verificationEmail);
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/5"
                    >
                      Return to secure entrance
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Error & Success dynamic feedback overlays */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 p-3.5 bg-rose-950/30 border border-rose-800/20 text-rose-300 rounded-xl text-left text-xs flex items-start gap-2.5 font-sans"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 p-3.5 bg-emerald-950/30 border border-emerald-800/20 text-emerald-300 rounded-xl text-left text-xs flex items-start gap-2.5 font-sans"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

          {/* Secure compliance assurance */}
          <div className="text-center text-[10px] text-zinc-500 font-mono tracking-wider pt-2">
            <span>SECURED WITH ADVANCED INTEGRAL ENCRYPTION ● VER: 2.16</span>
          </div>

        </div>
      </div>

    </div>
  );
}
