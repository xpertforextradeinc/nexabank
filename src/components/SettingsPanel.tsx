import { useState, DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Check, Award, ToggleLeft, ToggleRight, Lock, Key, AlertCircle, 
  Upload, CheckCircle2, Moon, Sun, ClipboardCheck, Settings, Eye, Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsPanelProps {
  user: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddAuditLog: (action: string, details: string) => void;
  activeSection?: 'profile' | 'security' | 'settings';
}

export default function SettingsPanel({ 
  user, 
  isDarkMode, 
  onToggleDarkMode, 
  onUpdateUser, 
  onAddAuditLog,
  activeSection = 'profile'
}: SettingsPanelProps) {
  // Security States
  const [pin, setPin] = useState(user.withdrawalPin || '');
  const [pinMsg, setPinMsg] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [phoneMsg, setPhoneMsg] = useState('');

  // Drag-and-Drop KYC State
  const [isDragging, setIsDragging] = useState(false);
  const [kycFile, setKycFile] = useState<string | null>(null);
  const [kycSuccess, setKycSuccess] = useState(false);

  // General settings state
  const [notifPref, setNotifPref] = useState('all');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState('');

  // Handle PIN Save
  const handlePinSave = () => {
    setPinMsg('');
    if (pin.length !== 4 || isNaN(parseInt(pin))) {
      setPinMsg('PIN must be exactly 4 numerical digits.');
      return;
    }
    onUpdateUser({ withdrawalPin: pin });
    onAddAuditLog('Update Payout PIN', `User successfully updated withdrawal security PIN code.`);
    setPinMsg('PIN code saved and activated successfully!');
    setTimeout(() => setPinMsg(''), 3000);
  };

  // Toggle MFA
  const handleToggleMfa = () => {
    const nextMfa = !user.mfaEnabled;
    onUpdateUser({ mfaEnabled: nextMfa });
    onAddAuditLog('Toggle MFA Protection', `User changed Multi-Factor Authentication setting to: ${nextMfa ? 'ENABLED' : 'DISABLED'}`);
  };

  // Toggle Withdrawal PIN Requirement
  const handleTogglePinRequired = () => {
    const nextReq = !user.withdrawalPinRequired;
    onUpdateUser({ withdrawalPinRequired: nextReq });
    onAddAuditLog('Toggle PIN Enforcement', `User updated payout PIN requirement policy to: ${nextReq ? 'ENFORCED' : 'OFF'}`);
  };

  // Drag-and-Drop KYC triggers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setKycFile(file.name);
    setKycSuccess(true);
    onUpdateUser({ verificationStatus: 'pending' });
    onAddAuditLog('Upload KYC Handshake Documents', `User dispatched identity verification credential file: "${file.name}"`);
    setTimeout(() => setKycSuccess(false), 5000);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const saveGeneralSettings = (e: FormEvent) => {
    e.preventDefault();
    setSettingsSaved('Preferences updated and synchronized with custody nodes.');
    setTimeout(() => setSettingsSaved(''), 4000);
  };

  return (
    <div className="w-full text-left font-sans">
      <AnimatePresence mode="wait">
        
        {/* SECTION 1: PROFILE & KYC */}
        {activeSection === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Profile Summary Card (5 cols) */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative`}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 p-0.5"
                  />
                  <span className={`absolute bottom-0 right-0 px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full border ${
                    user.verificationStatus === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {user.verificationStatus.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base flex items-center gap-1.5 justify-center">
                  {user.name}
                  {user.isUpgraded && <Award className="w-4 h-4 text-indigo-500" />}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-slate-100 dark:bg-zinc-950 rounded-full font-mono text-[9px] text-slate-500 dark:text-zinc-400">
                  LEDGER MEMBER SINCE: {user.joinedDate.toUpperCase()}
                </span>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100/10 space-y-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Authority Role:</span>
                  <span className="font-mono font-bold capitalize text-slate-800 dark:text-zinc-300">{user.role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Account status:</span>
                  <span className="font-mono font-semibold capitalize text-emerald-500">{user.status}</span>
                </div>
              </div>
            </div>

            {/* KYC Upload (7 cols) */}
            <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
              <div className="mb-4">
                <h3 className="font-display font-bold text-base mb-1">Identity verification upgrade (KYC)</h3>
                <p className="text-xs text-slate-500">Provide official identification documents to upgrade your ledger limits.</p>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition duration-300 flex flex-col items-center justify-center cursor-pointer relative ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/5' 
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 bg-transparent'
                }`}
                onClick={() => document.getElementById('settings-kyc-input')?.click()}
              >
                <input
                  type="file"
                  id="settings-kyc-input"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileInput}
                />

                <Upload className="w-8 h-8 text-slate-400 mb-2.5 animate-bounce" />
                <span className="text-xs font-semibold block mb-1">Drag and drop passport scan, or click to browse</span>
                <p className="text-[10px] text-slate-400">PDF, JPG, PNG sizes up to 10MB verified automatically inside sandbox.</p>

                {kycFile && (
                  <div className="mt-3.5 p-2 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200/50 dark:border-zinc-850 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-mono text-slate-700 dark:text-zinc-300">{kycFile}</span>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {kycSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 rounded-xl text-xs flex items-center gap-2 mt-4"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identity uploaded! Your verification is awaiting admin audit clearance.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* SECTION 2: SECURITY */}
        {activeSection === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-6 max-w-2xl`}
          >
            <div>
              <h3 className="font-display font-bold text-base mb-1">Administrative Security Controls</h3>
              <p className="text-xs text-slate-500">Configure Multi-Factor Authentication (MFA) and withdrawal lock parameters.</p>
            </div>

            <div className="space-y-4">
              {/* MFA Switch */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100/10">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-semibold block">2-Factor Handshake Verification (MFA)</span>
                  <p className="text-[10px] text-slate-400 max-w-sm">Requires verification passcode generated in Auth panel during session authorization.</p>
                </div>
                <button onClick={handleToggleMfa} className="text-slate-400 hover:text-indigo-500 transition">
                  {user.mfaEnabled ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10" />}
                </button>
              </div>

              {/* Withdrawal PIN toggle Switch */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100/10">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-semibold block">Require Withdrawal CodePIN</span>
                  <p className="text-[10px] text-slate-400 max-w-sm">Enforces security PIN challenge check prior to logging outbound cash discharge payloads.</p>
                </div>
                <button onClick={handleTogglePinRequired} className="text-slate-400 hover:text-indigo-500 transition">
                  {user.withdrawalPinRequired ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10" />}
                </button>
              </div>

              {/* PIN Code Configuration */}
              <div className="pt-2 space-y-3 text-left">
                <span className="text-xs font-semibold block">Set Withdrawal Security PIN</span>
                <p className="text-[10px] text-slate-400">Type a matching 4-digit code to overwrite the current transactional guard (e.g. 4890).</p>
                
                <div className="flex gap-3">
                  <input
                    type="password"
                    placeholder="••••"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-24 p-2 text-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 tracking-widest text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handlePinSave}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition rounded-xl font-medium text-xs font-sans"
                  >
                    Save PIN
                  </button>
                </div>
                
                {pinMsg && (
                  <p className={`text-[10px] font-sans ${pinMsg.includes('exactly') ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {pinMsg}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 3: SYSTEM PREFERENCES */}
        {activeSection === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Skin Settings (5 cols) */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} flex justify-between items-center`}>
              <div className="flex items-center gap-3 text-left">
                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-zinc-950 text-amber-400' : 'bg-amber-50 text-amber-500'}`}>
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-semibold block">Interface Skin</span>
                  <span className="text-[10px] text-slate-400">Toggle light / dark theme</span>
                </div>
              </div>
              
              <button
                onClick={onToggleDarkMode}
                className="p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-850 text-slate-700 dark:text-zinc-300 transition hover:scale-105 cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* General Preferences (7 cols) */}
            <form onSubmit={saveGeneralSettings} className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-6`}>
              <div>
                <h3 className="font-display font-bold text-base mb-1">General Preferences</h3>
                <p className="text-xs text-slate-500">Configure portal interface options and transaction reporting alerts.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Transactional Alert Tiers</label>
                  <select
                    value={notifPref}
                    onChange={(e) => setNotifPref(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-850 rounded-xl text-xs text-slate-800 dark:text-zinc-200"
                  >
                    <option value="all">Report All Ledger Movements (Recommended)</option>
                    <option value="withdrawals">Outbound Payments Only</option>
                    <option value="none">Mute Non-Compliance Notifications</option>
                  </select>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-left space-y-0.5">
                    <span className="text-xs font-semibold block">Stealth Mode</span>
                    <p className="text-[10px] text-slate-400">Mask balances in the primary headers for physical privacy.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrivacyMode(!privacyMode)}
                    className="text-slate-400 hover:text-indigo-500 transition"
                  >
                    {privacyMode ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10" />}
                  </button>
                </div>
              </div>

              {settingsSaved && <p className="text-emerald-500 text-xs font-semibold">{settingsSaved}</p>}

              <button type="submit" className="px-5 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold rounded-xl text-xs uppercase">
                Save Preferences
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
