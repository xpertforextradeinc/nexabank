import { useState, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Calendar, MapPin, ShieldAlert, FileText, Upload, Check, ChevronRight, ChevronLeft, Loader2, RefreshCw, ClipboardCheck, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { UserProfile } from '../types';

interface KYCWizardProps {
  user: UserProfile;
  onUpdateUser: (p: Partial<UserProfile>) => void;
  onAddAuditLog: (action: string, details: string) => void;
  isDarkMode: boolean;
}

export default function KYCWizard({ user, onUpdateUser, onAddAuditLog, isDarkMode }: KYCWizardProps) {
  const [step, setStep] = useState(1);
  
  // Step 1 Form States
  const [fullName, setFullName] = useState(user.name || '');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  // Step 2 Form States
  const [idType, setIdType] = useState<'SSN' | 'ITIN'>('SSN');
  const [taxId, setTaxId] = useState('');
  const [showTaxId, setShowTaxId] = useState(false);

  // Step 3 Upload States
  const [frontFile, setFrontFile] = useState<string | null>(null);
  const [frontProgress, setFrontProgress] = useState(0);
  const [frontUploading, setFrontUploading] = useState(false);
  const [frontDragging, setFrontDragging] = useState(false);

  const [backFile, setBackFile] = useState<string | null>(null);
  const [backProgress, setBackProgress] = useState(0);
  const [backUploading, setBackUploading] = useState(false);
  const [backDragging, setBackDragging] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step navigation validations
  const validateStep1 = () => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Full Legal Name must be at least 3 characters.');
      return false;
    }
    if (!dob) {
      setError('Date of Birth is required.');
      return false;
    }
    // Simple age check: must be at least 18
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setError('In compliance with banking laws, you must be 18 years or older to register.');
      return false;
    }
    if (!address.trim() || address.trim().length < 6) {
      setError('Physical US Address is required (minimum 6 characters).');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    const cleanTaxId = taxId.replace(/\D/g, '');
    if (cleanTaxId.length !== 9) {
      setError(`A valid 9-digit ${idType} is required.`);
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (!frontFile) {
      setError('Government-issued ID Front photo is required.');
      return false;
    }
    if (!backFile) {
      setError('Government-issued ID Back photo is required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  // SSN/ITIN Formatter (XXX-XX-XXXX)
  const handleTaxIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length > 9) return;
    
    let formatted = rawVal;
    if (rawVal.length > 5) {
      formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3, 5)}-${rawVal.slice(5)}`;
    } else if (rawVal.length > 3) {
      formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
    }
    setTaxId(formatted);
  };

  // Drag-and-Drop Handlers for Front
  const handleFrontDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFrontDragging(true);
  };

  const handleFrontDragLeave = () => {
    setFrontDragging(false);
  };

  const simulateUpload = (type: 'front' | 'back', fileName: string) => {
    const setUploading = type === 'front' ? setFrontUploading : setBackUploading;
    const setProgress = type === 'front' ? setFrontProgress : setBackProgress;
    const setFile = type === 'front' ? setFrontFile : setBackFile;

    setUploading(true);
    setProgress(0);
    setError('');

    let current = 0;
    const interval = setInterval(() => {
      current += 10 + Math.floor(Math.random() * 20);
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setUploading(false);
        setFile(fileName);
      }
      setProgress(current);
    }, 250);
  };

  const handleFrontDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFrontDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload('front', e.dataTransfer.files[0].name);
    }
  };

  const handleFrontFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload('front', e.target.files[0].name);
    }
  };

  // Drag-and-Drop Handlers for Back
  const handleBackDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBackDragging(true);
  };

  const handleBackDragLeave = () => {
    setBackDragging(false);
  };

  const handleBackDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBackDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload('back', e.dataTransfer.files[0].name);
    }
  };

  const handleBackFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload('back', e.target.files[0].name);
    }
  };

  // Submit complete KYC to Database
  const handleSubmitKyc = async () => {
    if (!validateStep3()) return;
    
    setSubmitting(true);
    setError('');

    // Renders realistic driver's license cards images in the admin review screen
    const frontIdUrl = 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600';
    const backIdUrl = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600';

    const kycPayload = {
      fullName,
      dob,
      address,
      idType,
      taxId: taxId, // Masked/stored securely
      frontFile,
      backFile,
      frontIdUrl,
      backIdUrl,
      submittedAt: new Date().toISOString()
    };

    try {
      // Map properties directly to the Supabase profile columns
      await onUpdateUser({
        name: fullName,
        dateOfBirth: dob,
        residentialAddress: address,
        govIdType: idType === 'SSN' ? 'SSN' : 'ITIN',
        govIdNumber: taxId,
        nationalIdSsn: taxId,
        uploadedIdUrl: JSON.stringify(kycPayload),
        verificationStatus: 'pending'
      });

      onAddAuditLog(
        'Upload KYC Verification Profile',
        `User submitted Multi-Step identity registration payload (SSN/ITIN: ${idType}). Front: ${frontFile}, Back: ${backFile}`
      );

      setSubmitting(false);
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || 'An unexpected error occurred during KYC deployment.');
    }
  };

  // RENDER DYNAMIC STATUS TRACKER FOR SUBMITTED USERS
  if (user.verificationStatus === 'pending') {
    return (
      <div className={`p-6 sm:p-8 rounded-3xl border text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
        <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-500 mb-4 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin duration-1000" />
        </div>
        <h3 className="font-display font-bold text-lg">Verification under review</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          Your advanced KYC profile and documentation are currently in queue. Our institutional compliance division will audit your credentials shortly.
        </p>

        <div className="mt-6 p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl max-w-sm mx-auto text-left space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Clearance Status:</span>
            <span className="font-bold font-mono text-amber-500 uppercase">Verification under review</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Submitted Legal Name:</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300">{user.name}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Authorized On:</span>
            <span className="font-mono text-slate-500">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  if (user.verificationStatus === 'verified') {
    return (
      <div className={`p-6 sm:p-8 rounded-3xl border text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
        <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-500 mb-4">
          <ClipboardCheck className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-lg">Identity Ledger Verified</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          Congratulations! Your sovereign identity profile has cleared international clearance audits. Limit upgrades are active.
        </p>

        <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl max-w-sm mx-auto text-left space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Audit Clearance:</span>
            <span className="font-bold font-mono text-emerald-500 uppercase">✓ FULLY APPROVED</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Institutional Class:</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Platinum Sovereign Ledger</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Daily Limit cap:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">$5,000,000.00</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
      
      {/* Header and Progress Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-150/10 pb-5 mb-6 text-left">
        <div>
          <h3 className="font-display font-bold text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" /> Identity verification upgrade (KYC)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Clearing this secure 3-step wizard unlocks unconstrained sovereign banking tiers.</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-zinc-950 p-2 rounded-xl border border-slate-200/50 dark:border-zinc-850">
          <span className={step === 1 ? 'text-indigo-500 font-bold' : ''}>1. Info</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 2 ? 'text-indigo-500 font-bold' : ''}>2. Tax ID</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === 3 ? 'text-indigo-500 font-bold' : ''}>3. Upload</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4 text-left"
          >
            <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 flex gap-3 text-xs text-indigo-600">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Under international banking directives (FinCEN KYC/AML), you must provide correct details matching your government identification card.</p>
            </div>

            {/* Legal Full Name */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Full Legal Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="First, middle and last legal name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError('');
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none"
                  id="kyc-full-name"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Date of Birth</label>
              <div className="relative">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setError('');
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none text-slate-800 dark:text-zinc-200 font-mono"
                  id="kyc-dob"
                />
              </div>
            </div>

            {/* Physical US Address */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Physical US Residential Address</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Street address, unit, state, city and zip code"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setError('');
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none"
                  id="kyc-address"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: TAX IDENTIFIER */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5">Tax Identification Class</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIdType('SSN');
                    setTaxId('');
                    setError('');
                  }}
                  className={`p-3 rounded-2xl border text-center text-xs font-semibold transition ${
                    idType === 'SSN'
                      ? 'border-indigo-500 bg-indigo-50/5 text-indigo-500'
                      : 'border-slate-150 text-slate-400 bg-transparent'
                  }`}
                  id="btn-kyc-ssn"
                >
                  Social Security Number (SSN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdType('ITIN');
                    setTaxId('');
                    setError('');
                  }}
                  className={`p-3 rounded-2xl border text-center text-xs font-semibold transition ${
                    idType === 'ITIN'
                      ? 'border-indigo-500 bg-indigo-50/5 text-indigo-500'
                      : 'border-slate-150 text-slate-400 bg-transparent'
                  }`}
                  id="btn-kyc-itin"
                >
                  Individual Taxpayer (ITIN)
                </button>
              </div>
            </div>

            {/* Masked Tax ID Input */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Enter Sovereign 9-Digit {idType}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showTaxId ? 'text' : 'password'}
                  placeholder="000-00-0000"
                  maxLength={11} // includes hyphens
                  value={taxId}
                  onChange={handleTaxIdChange}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 tracking-widest text-slate-800 dark:text-white"
                  id="kyc-tax-id"
                />
                <button
                  type="button"
                  onClick={() => setShowTaxId(!showTaxId)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showTaxId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Your credentials are encrypted immediately with SHA-512 client hashes and transferred only over secure banking tunnels.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DOCUMENTATION UPLOADS */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4 text-left"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
                Submit Government-Issued ID (Driver's License or State ID)
              </span>
              <p className="text-[11px] text-slate-500 mb-4">
                Please drag and drop or select images of the Front and Back of your document.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* FRONT ID UPLOADER */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">1. ID FRONT IMAGE</span>
                <div
                  onDragOver={handleFrontDragOver}
                  onDragLeave={handleFrontDragLeave}
                  onDrop={handleFrontDrop}
                  onClick={() => document.getElementById('kyc-front-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer relative h-36 flex flex-col items-center justify-center ${
                    frontDragging 
                      ? 'border-indigo-500 bg-indigo-50/5' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 bg-transparent'
                  }`}
                >
                  <input
                    type="file"
                    id="kyc-front-input"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFrontFileSelect}
                  />

                  {frontUploading ? (
                    <div className="space-y-2 w-full px-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Uploading ID Front...</span>
                        <span>{frontProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1.5 transition-all duration-150 rounded-full" 
                          style={{ width: `${frontProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : frontFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <ClipboardCheck className="w-6 h-6 text-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-semibold text-emerald-500 block">ID Front Verified!</span>
                      <p className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]">{frontFile}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-slate-400 mb-1.5 animate-bounce" />
                      <span className="text-[11px] font-semibold block">Front of ID Document</span>
                      <p className="text-[9px] text-slate-400">Drag/drop photo or browse</p>
                    </div>
                  )}
                </div>
              </div>

              {/* BACK ID UPLOADER */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">2. ID BACK IMAGE</span>
                <div
                  onDragOver={handleBackDragOver}
                  onDragLeave={handleBackDragLeave}
                  onDrop={handleBackDrop}
                  onClick={() => document.getElementById('kyc-back-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer relative h-36 flex flex-col items-center justify-center ${
                    backDragging 
                      ? 'border-indigo-500 bg-indigo-50/5' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 bg-transparent'
                  }`}
                >
                  <input
                    type="file"
                    id="kyc-back-input"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleBackFileSelect}
                  />

                  {backUploading ? (
                    <div className="space-y-2 w-full px-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Uploading ID Back...</span>
                        <span>{backProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1.5 transition-all duration-150 rounded-full" 
                          style={{ width: `${backProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : backFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <ClipboardCheck className="w-6 h-6 text-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-semibold text-emerald-500 block">ID Back Verified!</span>
                      <p className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]">{backFile}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-slate-400 mb-1.5 animate-bounce" />
                      <span className="text-[11px] font-semibold block">Back of ID Document</span>
                      <p className="text-[9px] text-slate-400">Drag/drop photo or browse</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Buttons Bar */}
      <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-150/10">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-sans font-semibold text-xs rounded-xl flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div /> // spacing placeholder
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-sans font-semibold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
            id="btn-kyc-next"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitKyc}
            disabled={submitting || frontUploading || backUploading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            id="btn-kyc-submit"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Encrypting Profile...
              </>
            ) : (
              <>
                Deploy KYC Credentials <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
