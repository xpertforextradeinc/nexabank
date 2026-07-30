import { useState, DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Check, Award, ToggleLeft, ToggleRight, Lock, Key, AlertCircle, 
  Upload, CheckCircle2, Moon, Sun, ClipboardCheck, Settings, Eye, EyeOff, Info,
  ShieldCheck, ShieldAlert, Smartphone, Laptop, Globe, RefreshCw, Terminal,
  History, QrCode, LogOut, Bell, AlertTriangle, Pencil, User, Mail, Phone,
  Calendar, MapPin, Briefcase, Camera, UserCheck, X, Save, UserCog, Loader2
} from 'lucide-react';
import { UserProfile, AuditLog } from '../types';
import KYCWizard from './KYCWizard';

interface SettingsPanelProps {
  user: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddAuditLog: (action: string, details: string) => void;
  activeSection?: 'profile' | 'security' | 'settings';
  auditLogs?: AuditLog[];
}

export default function SettingsPanel({ 
  user, 
  isDarkMode, 
  onToggleDarkMode, 
  onUpdateUser, 
  onAddAuditLog,
  activeSection = 'profile',
  auditLogs = []
}: SettingsPanelProps) {
  // Security PIN States
  const [pin, setPin] = useState(user.withdrawalPin || '');
  const [pinMsg, setPinMsg] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [phoneMsg, setPhoneMsg] = useState('');

  // Password Change States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Active Sessions State
  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: 'Chrome 127.0 (macOS)', ip: '198.51.100.42', location: 'New York, US', isCurrent: true, lastActive: 'Active Now' },
    { id: 'sess-2', device: 'Safari (iPhone 15 Pro)', ip: '172.56.21.10', location: 'New York, US', isCurrent: false, lastActive: '2 hours ago' },
    { id: 'sess-3', device: 'Firefox 125.0 (Windows 11)', ip: '104.28.19.45', location: 'London, UK', isCurrent: false, lastActive: '1 day ago' }
  ]);
  const [sessionRevokedMsg, setSessionRevokedMsg] = useState('');

  // Security Alert Preferences
  const [secAlerts, setSecAlerts] = useState({
    loginAlerts: true,
    highValLock: true,
    autoTimeout: true,
    unusualIpFlag: true
  });

  // 2FA Authenticator Modal Setup
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [totpInput, setTotpInput] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpSuccess, setTotpSuccess] = useState('');

  // Drag-and-Drop KYC State
  const [isDragging, setIsDragging] = useState(false);
  const [kycFile, setKycFile] = useState<string | null>(null);
  const [kycSuccess, setKycSuccess] = useState(false);

  // General settings state
  const [notifPref, setNotifPref] = useState('all');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState('');

  // PIN Reset states
  const [resetStage, setResetStage] = useState<'idle' | 'requesting' | 'verifying' | 'setting'>('idle');
  const [resetEmailCode, setResetEmailCode] = useState('');
  const [correctChallengeCode, setCorrectChallengeCode] = useState('');
  const [newResetPin, setNewResetPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Edit Profile Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editMiddleName, setEditMiddleName] = useState(user.middleName || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [editDob, setEditDob] = useState(user.dateOfBirth || '');
  const [editGender, setEditGender] = useState(user.gender || 'Prefer not to say');
  const [editAddress, setEditAddress] = useState(user.residentialAddress || '');
  const [editCity, setEditCity] = useState(user.city || '');
  const [editState, setEditState] = useState(user.stateProvince || '');
  const [editCountry, setEditCountry] = useState(user.country || '');
  const [editZip, setEditZip] = useState(user.zipPostalCode || '');
  const [editOccupation, setEditOccupation] = useState(user.occupation || '');
  const [editEmployer, setEditEmployer] = useState(user.employer || '');
  const [editAvatar, setEditAvatar] = useState(user.avatar || '');
  const [editProfileMsg, setEditProfileMsg] = useState('');
  const [editProfileError, setEditProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const AVATAR_PRESETS = [
    { id: 'av1', label: 'Executive Male', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120' },
    { id: 'av2', label: 'Professional Woman', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' },
    { id: 'av3', label: 'Corporate Executive', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120' },
    { id: 'av4', label: 'Tech Specialist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
    { id: 'av5', label: 'Modern Professional', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' }
  ];

  const handleOpenEditProfileModal = () => {
    setEditName(user.name || '');
    setEditMiddleName(user.middleName || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditDob(user.dateOfBirth || '');
    setEditGender(user.gender || 'Prefer not to say');
    setEditAddress(user.residentialAddress || '');
    setEditCity(user.city || '');
    setEditState(user.stateProvince || '');
    setEditCountry(user.country || '');
    setEditZip(user.zipPostalCode || '');
    setEditOccupation(user.occupation || '');
    setEditEmployer(user.employer || '');
    setEditAvatar(user.avatar || '');
    setEditProfileMsg('');
    setEditProfileError('');
    setShowEditProfileModal(true);
  };

  const handleSaveProfileDetails = (e: FormEvent) => {
    e.preventDefault();
    setEditProfileError('');
    setEditProfileMsg('');

    if (!editName.trim() || editName.trim().length < 2) {
      setEditProfileError('Full Name must be at least 2 characters long.');
      return;
    }

    if (!editEmail.trim() || !editEmail.includes('@')) {
      setEditProfileError('A valid email address is required.');
      return;
    }

    setIsSavingProfile(true);

    const updatedData: Partial<UserProfile> = {
      name: editName.trim(),
      middleName: editMiddleName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      dateOfBirth: editDob,
      gender: editGender,
      residentialAddress: editAddress.trim(),
      city: editCity.trim(),
      stateProvince: editState.trim(),
      country: editCountry.trim(),
      zipPostalCode: editZip.trim(),
      occupation: editOccupation.trim(),
      employer: editEmployer.trim(),
      avatar: editAvatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
    };

    onUpdateUser(updatedData);
    onAddAuditLog(
      'Update Personal Profile Details',
      `User updated details: Name (${editName.trim()}), Phone (${editPhone.trim()}), Email (${editEmail.trim()}), DOB (${editDob}).`
    );

    setTimeout(() => {
      setIsSavingProfile(false);
      setEditProfileMsg('Profile details successfully updated!');
      setTimeout(() => {
        setShowEditProfileModal(false);
        setEditProfileMsg('');
      }, 1200);
    }, 400);
  };

  // Security Health Calculation
  const calculateSecurityScore = () => {
    let score = 0;
    if (user.mfaEnabled) score += 25;
    if (user.withdrawalPinRequired && user.withdrawalPin) score += 25;
    if (user.verificationStatus === 'verified') score += 25;
    if (user.status === 'active') score += 25;
    return score;
  };

  const securityScore = calculateSecurityScore();

  // Password Strength Evaluator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'None', score: 0, color: 'bg-slate-200 dark:bg-zinc-800' };
    if (pass.length < 6) return { label: 'Weak', score: 25, color: 'bg-rose-500' };
    let score = 50;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score >= 90) return { label: 'Bank-Grade (Ultra Secure)', score: 100, color: 'bg-emerald-500' };
    if (score >= 70) return { label: 'Strong', score: 75, color: 'bg-indigo-500' };
    return { label: 'Moderate', score: 50, color: 'bg-amber-500' };
  };

  const passStrength = getPasswordStrength(newPass);

  // Password Change Handler
  const handlePasswordUpdate = (e: FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');
    if (!currentPass) {
      setPassError('Current password is required to verify identity.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match. Please verify and retry.');
      return;
    }
    onAddAuditLog('Update Passphrase Credential', 'User successfully changed login security password.');
    setPassMsg('Password successfully changed & re-encrypted across secure vault!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassMsg(''), 4000);
  };

  // Revoke External Sessions Handler
  const handleRevokeSessions = () => {
    setSessions(sessions.filter(s => s.isCurrent));
    onAddAuditLog('Revoke External Sessions', 'User invalidated 2 active remote session tokens.');
    setSessionRevokedMsg('All external devices have been logged out successfully.');
    setTimeout(() => setSessionRevokedMsg(''), 4000);
  };

  // 2FA TOTP Verification Handler
  const handleVerify2faSetup = () => {
    setTotpError('');
    if (totpInput.trim().length !== 6 || isNaN(parseInt(totpInput))) {
      setTotpError('Verification code must be 6 numerical digits.');
      return;
    }
    onUpdateUser({ mfaEnabled: true });
    onAddAuditLog('Enable 2FA Protection', 'User verified TOTP authenticator app and enabled 2-Factor Authentication.');
    setTotpSuccess('2-Factor Authentication successfully paired & activated!');
    setTimeout(() => {
      setShow2faSetup(false);
      setTotpSuccess('');
      setTotpInput('');
    }, 2000);
  };

  const handleInitiatePinReset = () => {
    setResetError('');
    setResetStage('requesting');
    
    // Simulate sending multi-stage challenge code
    setTimeout(() => {
      const randomCode = `NEXA-${Math.floor(1000 + Math.random() * 9000)}`;
      setCorrectChallengeCode(randomCode);
      setResetStage('verifying');
      onAddAuditLog('Initiate Payout PIN Reset Flow', `Security sentinel dispatched temporary multi-stage email challenge code.`);
      alert(`[Demo Mode Security Verification]\nA security challenge code has been dispatched to: ${user.email}\nCode: ${randomCode}`);
    }, 1500);
  };

  const handleVerifyPinReset = () => {
    setResetError('');
    if (resetEmailCode.trim().toUpperCase() !== correctChallengeCode) {
      setResetError('Invalid security challenge code. Please try again.');
      return;
    }
    setResetStage('setting');
  };

  const handleCompletePinReset = () => {
    setResetError('');
    if (newResetPin.length !== 4 || isNaN(parseInt(newResetPin))) {
      setResetError('New PIN must be exactly 4 numerical digits.');
      return;
    }
    onUpdateUser({ withdrawalPin: newResetPin });
    onAddAuditLog('Complete Payout PIN Reset Flow', `User successfully authorized security challenge code and reset withdrawal PIN.`);
    setResetSuccessMsg('PIN successfully reset and re-synchronized!');
    setResetStage('idle');
    setPin(newResetPin);
    setNewResetPin('');
    setResetEmailCode('');
    setCorrectChallengeCode('');
    setTimeout(() => setResetSuccessMsg(''), 4000);
  };

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
    if (nextMfa) {
      setShow2faSetup(true);
    } else {
      onUpdateUser({ mfaEnabled: false });
      onAddAuditLog('Toggle MFA Protection', 'User changed Multi-Factor Authentication setting to: DISABLED');
    }
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

  // Filter user audit logs
  const userAuditLogs = auditLogs.filter(log => log.actorId === user.id || log.actorName === user.name);

  return (
    <div className="w-full text-left font-sans space-y-8">
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
              
              {/* Top-Right Edit Profile Icon Button */}
              <button
                onClick={handleOpenEditProfileModal}
                className="absolute top-5 right-5 p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-indigo-500/20 shadow-sm"
                title="Update Personal Details"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 group cursor-pointer" onClick={handleOpenEditProfileModal}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 p-0.5 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm border border-white dark:border-zinc-900" title="Change Avatar">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-base flex items-center gap-1.5 justify-center">
                  {user.name}
                  {user.isUpgraded && <Award className="w-4 h-4 text-indigo-500" />}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                
                <div className="mt-2.5">
                  <span className={`px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full border ${
                    user.verificationStatus === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {user.verificationStatus === 'pending' ? 'Verification under review' : user.verificationStatus.toUpperCase()}
                  </span>
                </div>

                <span className="inline-block mt-3 px-3 py-1 bg-slate-100 dark:bg-zinc-950 rounded-full font-mono text-[9px] text-slate-500 dark:text-zinc-400">
                  LEDGER MEMBER SINCE: {user.joinedDate.toUpperCase()}
                </span>
              </div>

              {/* Personal Details Breakdown List */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone:
                  </span>
                  <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {user.phone || 'Not set'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date of Birth:
                  </span>
                  <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {user.dateOfBirth || 'Not set'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Address:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[190px]" title={[user.residentialAddress, user.city, user.country].filter(Boolean).join(', ')}>
                    {[user.residentialAddress, user.city, user.country].filter(Boolean).join(', ') || 'Not set'}
                  </span>
                </div>

                {user.gender && user.gender !== 'Prefer not to say' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" /> Gender:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 capitalize">
                      {user.gender}
                    </span>
                  </div>
                )}

                {(user.occupation || user.employer) && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Occupation:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[180px]">
                      {user.occupation || ''} {user.employer ? `(${user.employer})` : ''}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-400">Authority Role:</span>
                  <span className="font-mono font-bold capitalize text-slate-800 dark:text-zinc-300">{user.role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Account status:</span>
                  <span className="font-mono font-semibold capitalize text-emerald-500">{user.status}</span>
                </div>
              </div>

              {/* Bottom Quick Action Edit Button */}
              <button
                onClick={handleOpenEditProfileModal}
                className="w-full mt-5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-indigo-400" />
                <span>Update Personal Details</span>
              </button>
            </div>

            {/* KYC Upload (7 cols) */}
            <div className="lg:col-span-7">
              <KYCWizard 
                user={user}
                onUpdateUser={onUpdateUser}
                onAddAuditLog={onAddAuditLog}
                isDarkMode={isDarkMode}
              />
            </div>
          </motion.div>
        )}

        {/* SECTION 2: APP SECURITY SUITE */}
        {activeSection === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Security Posture & Shield Score Banner */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} relative overflow-hidden`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    securityScore === 100 
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30'
                  }`}>
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-lg">Account Security Posture</h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                        securityScore === 100 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {securityScore === 100 ? 'SOVEREIGN PROTECTION (100%)' : `${securityScore}% PROTECTED`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Multi-layered cryptographic defense & transaction guards active on your NexaBank ledger account.
                    </p>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Security Index</span>
                    <span className="font-bold text-slate-900 dark:text-white">{securityScore}/100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-zinc-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        securityScore === 100 ? 'bg-emerald-500' : securityScore >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${securityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Security Checklist Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${user.mfaEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'}`}>
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">2-Factor Auth (MFA)</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${user.withdrawalPinRequired && user.withdrawalPin ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'}`}>
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Payout Security PIN</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${user.verificationStatus === 'verified' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'}`}>
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">KYC Verified</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${user.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'}`}>
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Ledger Status Active</span>
                </div>
              </div>
            </div>

            {/* Grid layout for Security Features */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (7 cols): Administrative Security & Password Change */}
              <div className="lg:col-span-7 space-y-8">

                {/* Card 1: 2FA & PIN Controls */}
                <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-6`}>
                  <div>
                    <h4 className="font-display font-bold text-base mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-500" /> Administrative Security Controls
                    </h4>
                    <p className="text-xs text-slate-500">Configure Multi-Factor Authentication (MFA) and withdrawal security guards.</p>
                  </div>

                  <div className="space-y-4">
                    {/* MFA Switch */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-semibold block">2-Factor Handshake Verification (MFA)</span>
                        <p className="text-[10px] text-slate-400 max-w-sm">Requires verification passcode generated via TOTP Authenticator during session authorization.</p>
                      </div>
                      <button onClick={handleToggleMfa} className="text-slate-400 hover:text-indigo-500 transition">
                        {user.mfaEnabled ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10" />}
                      </button>
                    </div>

                    {/* Withdrawal PIN toggle Switch */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-semibold block">Require Withdrawal Code PIN</span>
                        <p className="text-[10px] text-slate-400 max-w-sm">Enforces a 4-digit PIN security challenge check prior to processing outbound cash withdrawals.</p>
                      </div>
                      <button onClick={handleTogglePinRequired} className="text-slate-400 hover:text-indigo-500 transition">
                        {user.withdrawalPinRequired ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10" />}
                      </button>
                    </div>

                    {/* PIN Code Configuration */}
                    <div className="pt-2 space-y-4 text-left border-t border-slate-100 dark:border-zinc-800 mt-4">
                      <div>
                        <span className="text-xs font-semibold block">Set Withdrawal Security PIN</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Type a matching 4-digit code to set or overwrite your transactional guard (e.g. 4890).</p>
                      </div>
                      
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

                      {/* Multi-stage Payout PIN Reset */}
                      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                        <div>
                          <span className="text-xs font-semibold block flex items-center gap-1.5 text-indigo-500 dark:text-emerald-400">
                            <Lock className="w-3.5 h-3.5" /> Lost or Forgot PIN?
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Initiate a multi-stage challenge-response sequence to reset your payout PIN code securely.</p>
                        </div>

                        {resetStage === 'idle' && (
                          <button
                            type="button"
                            onClick={handleInitiatePinReset}
                            className="px-4 py-2 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/5 transition rounded-xl font-medium text-xs font-sans"
                          >
                            Initiate Secure PIN Reset
                          </button>
                        )}

                        {resetStage === 'requesting' && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span>Generating secure cryptographic challenge...</span>
                          </div>
                        )}

                        {resetStage === 'verifying' && (
                          <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-xl">
                            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Enter Challenge Code</span>
                            <p className="text-[10px] text-slate-500">Provide the challenge code sent to {user.email}. Check alert if code is missed.</p>
                            
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="NEXA-XXXX"
                                value={resetEmailCode}
                                onChange={(e) => setResetEmailCode(e.target.value)}
                                className="flex-1 p-2 bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl text-xs font-mono uppercase tracking-widest text-slate-800 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyPinReset}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white transition rounded-xl font-medium text-xs font-sans"
                              >
                                Verify Code
                              </button>
                            </div>
                          </div>
                        )}

                        {resetStage === 'setting' && (
                          <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-xl">
                            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Establish New PIN</span>
                            
                            <div className="flex gap-2">
                              <input
                                type="password"
                                placeholder="••••"
                                maxLength={4}
                                value={newResetPin}
                                onChange={(e) => setNewResetPin(e.target.value)}
                                className="w-24 p-2 text-center bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 tracking-widest text-slate-800 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={handleCompletePinReset}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-medium text-xs font-sans"
                              >
                                Reset PIN
                              </button>
                            </div>
                          </div>
                        )}

                        {resetError && (
                          <p className="text-[10px] text-rose-500 font-mono mt-1">{resetError}</p>
                        )}
                        {resetSuccessMsg && (
                          <p className="text-[10px] text-emerald-500 font-semibold font-mono mt-1">{resetSuccessMsg}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Password & Passphrase Update */}
                <form onSubmit={handlePasswordUpdate} className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-5`}>
                  <div>
                    <h4 className="font-display font-bold text-base mb-1 flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-500" /> Account Password & Passphrase
                    </h4>
                    <p className="text-xs text-slate-500">Update your primary security credential to protect account access.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {newPass && (
                        <div className="pt-2 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Strength Rating:</span>
                            <span className="font-semibold">{passStrength.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${passStrength.color} transition-all duration-300`}
                              style={{ width: `${passStrength.score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    {passError && <p className="text-rose-500 text-[11px] font-semibold">{passError}</p>}
                    {passMsg && <p className="text-emerald-500 text-[11px] font-semibold">{passMsg}</p>}

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold rounded-xl text-xs hover:opacity-90 transition"
                    >
                      Update Account Password
                    </button>
                  </div>
                </form>

              </div>

              {/* Right Column (5 cols): Active Sessions & Security Audit Log */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Active Sessions Manager */}
                <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-5`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-base mb-0.5 flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-indigo-500" /> Active Sessions
                      </h4>
                      <p className="text-[11px] text-slate-500">Recognized hardware devices connected to your ledger.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <div 
                        key={sess.id}
                        className={`p-3.5 rounded-2xl border text-xs ${
                          sess.isCurrent 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200/60 dark:border-zinc-850'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            {sess.device.includes('iPhone') ? (
                              <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                            ) : (
                              <Laptop className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <div>
                              <span className="font-semibold block text-slate-900 dark:text-white">{sess.device}</span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                IP: {sess.ip} • {sess.location}
                              </span>
                            </div>
                          </div>
                          
                          {sess.isCurrent ? (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                              THIS DEVICE
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-slate-400">{sess.lastActive}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {sessionRevokedMsg && (
                    <p className="text-[11px] text-emerald-500 font-semibold font-mono">{sessionRevokedMsg}</p>
                  )}

                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={handleRevokeSessions}
                      className="w-full py-2.5 px-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Revoke All Other Sessions
                    </button>
                  )}
                </div>

                {/* Threat & Security Alert Toggles */}
                <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-4`}>
                  <div>
                    <h4 className="font-display font-bold text-base mb-1 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" /> Fraud Defense & Alerts
                    </h4>
                    <p className="text-xs text-slate-500">Automated sentinel defense rules for account activity.</p>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800">
                      <div>
                        <span className="font-semibold block">New Device Sign-In Alert</span>
                        <span className="text-[10px] text-slate-400">Email alert on unrecognized hardware logins</span>
                      </div>
                      <button 
                        onClick={() => setSecAlerts({...secAlerts, loginAlerts: !secAlerts.loginAlerts})}
                        className="text-slate-400 hover:text-indigo-500 transition"
                      >
                        {secAlerts.loginAlerts ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800">
                      <div>
                        <span className="font-semibold block">High-Value Transfer Lock</span>
                        <span className="text-[10px] text-slate-400">Secondary approval required for transfers &gt; $5,000</span>
                      </div>
                      <button 
                        onClick={() => setSecAlerts({...secAlerts, highValLock: !secAlerts.highValLock})}
                        className="text-slate-400 hover:text-indigo-500 transition"
                      >
                        {secAlerts.highValLock ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="font-semibold block">Auto Session Timeout</span>
                        <span className="text-[10px] text-slate-400">Auto lock workspace after 15 min idle</span>
                      </div>
                      <button 
                        onClick={() => setSecAlerts({...secAlerts, autoTimeout: !secAlerts.autoTimeout})}
                        className="text-slate-400 hover:text-indigo-500 transition"
                      >
                        {secAlerts.autoTimeout ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Security Activity Trail */}
                <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-base mb-0.5 flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-500" /> Security Audit Log
                      </h4>
                      <p className="text-[11px] text-slate-500">Your recent security events & access logs.</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                    {userAuditLogs.length > 0 ? (
                      userAuditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-150/50 dark:border-zinc-850 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[11px] text-slate-900 dark:text-zinc-200">{log.action}</span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{log.details}</p>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-150/50 dark:border-zinc-850 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[11px] text-emerald-500">Secure Session Authorized</span>
                            <span className="text-[9px] font-mono text-slate-400">Just Now</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Encrypted JWT session handshake verified with primary custody ledger node.</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-150/50 dark:border-zinc-850 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[11px] text-slate-900 dark:text-zinc-200">2FA Policy Check</span>
                            <span className="text-[9px] font-mono text-slate-400">Today, 08:30</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Device fingerprint & MFA state verified clean.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* 2FA Authenticator Modal Setup */}
            <AnimatePresence>
              {show2faSetup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-xl text-slate-900'} space-y-5 text-left`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-display font-bold text-base">Pair Authenticator App</h4>
                      </div>
                      <button
                        onClick={() => setShow2faSetup(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-slate-500">
                      Scan the QR code below using Google Authenticator, Authy, or 1Password to generate 2FA passcodes.
                    </p>

                    {/* QR Code Graphic Container */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2">
                      <div className="w-36 h-36 bg-slate-900 p-2.5 rounded-xl flex items-center justify-center relative shadow-inner">
                        <div className="grid grid-cols-6 grid-rows-6 gap-1.5 w-full h-full">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`rounded-sm ${
                                (i * 7) % 3 === 0 || i % 5 === 0 ? 'bg-emerald-400' : (i * 11) % 4 === 0 ? 'bg-white' : 'bg-zinc-800'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 font-bold tracking-widest">
                        SECRET: NEXA-8842-7719-2041
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                        Enter 6-Digit Authenticator Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={totpInput}
                        onChange={(e) => setTotpInput(e.target.value)}
                        className="w-full p-3 text-center bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-mono text-base tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      {totpError && <p className="text-rose-500 text-[11px] font-semibold">{totpError}</p>}
                      {totpSuccess && <p className="text-emerald-500 text-[11px] font-semibold">{totpSuccess}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShow2faSetup(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleVerify2faSetup}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-md"
                      >
                        Verify &amp; Activate 2FA
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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

      {/* EDIT PROFILE MODAL DIALOG */}
      <AnimatePresence>
        {showEditProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEditProfileModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-2xl rounded-3xl border ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-2xl text-slate-900'
              } p-6 sm:p-8 my-auto space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-left`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg leading-snug">Update Profile Details</h3>
                    <p className="text-xs text-slate-400">Modify your legal identity, contact details, date of birth & address.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfileDetails} className="space-y-6">

                {/* Avatar Preset & Custom Selection */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                    Profile Picture / Avatar
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {AVATAR_PRESETS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.url)}
                        className={`relative rounded-full transition-transform cursor-pointer ${
                          editAvatar === av.url ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} className="w-10 h-10 rounded-full object-cover" />
                        {editAvatar === av.url && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Or enter custom avatar image URL:</label>
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Section 1: Core Credentials (Name, Middle, Email, Phone) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Identity & Contact Credentials
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="e.g. Wentworth Luckman"
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Middle Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={editMiddleName}
                        onChange={(e) => setEditMiddleName(e.target.value)}
                        placeholder="e.g. Hassan"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="name@domain.com"
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+1 (555) 019-2831"
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Birth & Demographics */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date of Birth & Demographics
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Gender Designation
                      </label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Physical Address */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Residential Location Details
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="e.g. 742 Evergreen Terrace"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">City</label>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          placeholder="New York"
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">State / Prov.</label>
                        <input
                          type="text"
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          placeholder="NY"
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Country</label>
                        <input
                          type="text"
                          value={editCountry}
                          onChange={(e) => setEditCountry(e.target.value)}
                          placeholder="United States"
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Zip / Postal</label>
                        <input
                          type="text"
                          value={editZip}
                          onChange={(e) => setEditZip(e.target.value)}
                          placeholder="10001"
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Professional Info */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Employment & Professional Data
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Occupation</label>
                      <input
                        type="text"
                        value={editOccupation}
                        onChange={(e) => setEditOccupation(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Employer</label>
                      <input
                        type="text"
                        value={editEmployer}
                        onChange={(e) => setEditEmployer(e.target.value)}
                        placeholder="e.g. Nexa Capital Global"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback Messages */}
                {editProfileError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editProfileError}</span>
                  </div>
                )}

                {editProfileMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{editProfileMsg}</span>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile Details</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

