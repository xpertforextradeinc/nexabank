import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Sparkles, LogOut, Bell, Clock, Compass, HelpCircle, ChevronRight, 
  RefreshCw, BarChart3, TrendingUp, Settings, History, Send, ArrowUpRight, 
  ArrowDownRight, Wallet as WalletIcon, User, Menu, X, Award, Eye, Key, AlertTriangle, 
  CreditCard as CardIcon, ShieldAlert, ListFilter, Users as UsersIcon, Database, Terminal,
  LayoutDashboard, Landmark, FileText, Activity, Search, Info, Check
} from 'lucide-react';

import { 
  UserProfile, Wallet as BankWallet, BankTransaction, DepositRequest, 
  WithdrawalRequest, AuditLog, BankNotification, CreditCard, SavingsGoal, Transaction 
} from './types';

import { getSupabase, isSupabaseConfigured } from './lib/supabase';

// Reusable components
import AuthScreens from './components/AuthScreens';
import DashboardOverview from './components/DashboardOverview';
import DepositWithdraw from './components/DepositWithdraw';
import TransferFunds from './components/TransferFunds';
import TransactionsHistory from './components/TransactionsHistory';
import SettingsPanel from './components/SettingsPanel';
import AdminPanel from './components/AdminPanel';
import { DebugConsole } from './components/DebugConsole';
import Services from './components/Services';

// Old compatibility components used in dashboard/custom views
import InteractiveCard from './components/InteractiveCard';
import GoalTracker from './components/GoalTracker';
import TransactionSimulator from './components/TransactionSimulator';

// Mapping utilities to go between snake_case DB fields and camelCase frontend props
function mapProfileFromDB(db: any): UserProfile {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    role: db.role,
    status: db.status,
    withdrawalPinRequired: db.withdrawal_pin_required,
    withdrawalPin: db.withdrawal_pin,
    isUpgraded: db.is_upgraded,
    phone: db.phone || '+1 (555) 019-2831',
    mfaEnabled: db.mfa_enabled,
    mfaCode: db.mfa_code,
    verificationStatus: db.verification_status,
    avatar: db.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    joinedDate: db.joined_date ? new Date(db.joined_date).toLocaleDateString() : '',
    withdrawalsLocked: db.withdrawals_locked,
    // Step 1 - Personal Details
    middleName: db.middle_name,
    dateOfBirth: db.date_of_birth,
    gender: db.gender,
    // Step 2 - Address
    country: db.country,
    stateProvince: db.state_province,
    city: db.city,
    zipPostalCode: db.zip_postal_code,
    residentialAddress: db.residential_address,
    // Step 3 - Financial Profile
    employmentStatus: db.employment_status,
    occupation: db.occupation,
    employer: db.employer,
    annualIncome: db.annual_income ? Number(db.annual_income) : undefined,
    sourceFunds: db.source_funds,
    // Step 4 - Identity
    govIdType: db.gov_id_type,
    govIdNumber: db.gov_id_number,
    nationalIdSsn: db.national_id_ssn,
    uploadedIdUrl: db.uploaded_id_url,
    // Generated Core Banking Numbers
    accountNumber: db.account_number || '3049204109',
    routingNumber: db.routing_number || '021000021'
  };
}

function mapProfileToDB(p: Partial<UserProfile>): any {
  const db: any = {};
  if (p.name !== undefined) db.name = p.name;
  if (p.email !== undefined) db.email = p.email;
  if (p.role !== undefined) db.role = p.role;
  if (p.status !== undefined) db.status = p.status;
  if (p.withdrawalPinRequired !== undefined) db.withdrawal_pin_required = p.withdrawalPinRequired;
  if (p.withdrawalPin !== undefined) db.withdrawal_pin = p.withdrawalPin;
  if (p.isUpgraded !== undefined) db.is_upgraded = p.isUpgraded;
  if (p.phone !== undefined) db.phone = p.phone;
  if (p.mfaEnabled !== undefined) db.mfa_enabled = p.mfaEnabled;
  if (p.verificationStatus !== undefined) db.verification_status = p.verificationStatus;
  if (p.avatar !== undefined) db.avatar = p.avatar;
  if (p.withdrawalsLocked !== undefined) db.withdrawals_locked = p.withdrawalsLocked;
  // Onboarding fields mapping to database
  if (p.middleName !== undefined) db.middle_name = p.middleName;
  if (p.dateOfBirth !== undefined) db.date_of_birth = p.dateOfBirth;
  if (p.gender !== undefined) db.gender = p.gender;
  if (p.country !== undefined) db.country = p.country;
  if (p.stateProvince !== undefined) db.state_province = p.stateProvince;
  if (p.city !== undefined) db.city = p.city;
  if (p.zipPostalCode !== undefined) db.zip_postal_code = p.zipPostalCode;
  if (p.residentialAddress !== undefined) db.residential_address = p.residentialAddress;
  if (p.employmentStatus !== undefined) db.employment_status = p.employmentStatus;
  if (p.occupation !== undefined) db.occupation = p.occupation;
  if (p.employer !== undefined) db.employer = p.employer;
  if (p.annualIncome !== undefined) db.annual_income = p.annualIncome;
  if (p.sourceFunds !== undefined) db.source_funds = p.sourceFunds;
  if (p.govIdType !== undefined) db.gov_id_type = p.govIdType;
  if (p.govIdNumber !== undefined) db.gov_id_number = p.govIdNumber;
  if (p.nationalIdSsn !== undefined) db.national_id_ssn = p.nationalIdSsn;
  if (p.uploadedIdUrl !== undefined) db.uploaded_id_url = p.uploadedIdUrl;
  if (p.accountNumber !== undefined) db.account_number = p.accountNumber;
  if (p.routingNumber !== undefined) db.routing_number = p.routingNumber;
  return db;
}

function mapWalletFromDB(db: any): BankWallet {
  return {
    userId: db.user_id,
    mainBalance: Number(db.main_balance),
    availableBalance: Number(db.available_balance),
    pendingBalance: Number(db.pending_balance),
    savingsBalance: Number(db.savings_balance)
  };
}

function mapTransactionFromDB(db: any): BankTransaction {
  return {
    id: db.id,
    userId: db.user_id,
    description: db.description,
    amount: Number(db.amount),
    date: db.date,
    category: db.category,
    type: db.type,
    status: db.status,
    reference: db.reference
  };
}

function mapDepositFromDB(db: any): DepositRequest {
  return {
    id: db.id,
    userId: db.user_id,
    userName: db.user_name || 'NexaBank Customer',
    amount: Number(db.amount),
    method: db.method,
    status: db.status,
    date: db.date,
    reference: db.reference
  };
}

function mapWithdrawalFromDB(db: any): WithdrawalRequest {
  return {
    id: db.id,
    userId: db.user_id,
    userName: db.user_name || 'NexaBank Customer',
    amount: Number(db.amount),
    method: db.method,
    status: db.status,
    date: db.date,
    reference: db.reference
  };
}

function mapAuditLogFromDB(db: any): AuditLog {
  return {
    id: db.id,
    actorId: db.actor_id || 'system',
    actorName: db.actor_name || 'Automated Sentry',
    action: db.action,
    targetUserId: db.target_user_id || 'none',
    targetUserName: db.target_user_name || 'none',
    details: db.details,
    timestamp: db.timestamp
  };
}

function mapNotificationFromDB(db: any): BankNotification {
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    message: db.message,
    read: db.read,
    timestamp: db.timestamp
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Initialize supabase instance safely
  const supabase = useMemo(() => {
    try {
      return getSupabase();
    } catch (e) {
      console.error("App: Supabase initialization failed", e);
      return null;
    }
  }, []);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  // Core database states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [wallets, setWallets] = useState<BankWallet[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<BankNotification[]>([]);

  // UI state overlays
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cardColor, setCardColor] = useState<'emerald' | 'slate' | 'indigo' | 'amber'>('indigo');
  const [cardFrozen, setCardFrozen] = useState<boolean>(false);

  // New states for interactive sidebar and support desk
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');
  const [selectedAdminUser, setSelectedAdminUser] = useState<UserProfile | null>(null);
  const [supportTickets, setSupportTickets] = useState<{ id: string; subject: string; message: string; severity: string; date: string; status: 'open' | 'resolved' }[]>([
    { id: 'ST-9021', subject: 'Inbound Wire Transfer Delay', message: 'My TRC-20 deposit of $15,000 has been in pending handshake status for 1 hour.', severity: 'high', date: '2026-06-29', status: 'open' },
    { id: 'ST-4820', subject: 'Upgrade to Nexa Capital Premium', message: 'I uploaded my passport file. Please audit and upgrade my portfolio.', severity: 'medium', date: '2026-06-28', status: 'resolved' }
  ]);

  // UTC clock ticker
  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session on mount...");
      const { data } = await getSupabase().auth.getSession();
      console.log("Session check result:", data);
      if (data.session?.user) {
        console.log("Session found, loading user data...");
        loadUserData(data.session.user.id, 'user');
      }
      setLoading(false);
    };
    checkSession();

    const ticker = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' UTC');
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Toast notification helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Safe retry-fetch helper to ensure trigger handles profiles correctly on brand new signups
  const fetchProfileWithRetry = async (userId: string, attempts = 5, delay = 500): Promise<any> => {
    if (!isSupabaseConfigured()) return null;
    for (let i = 0; i < attempts; i++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data && !error) return data;
      await new Promise((res) => setTimeout(res, delay));
    }
    return null;
  };

  // Core data loaders mapping to role
  const loadUserData = async (userId: string, role: 'user' | 'admin') => {
    console.log("loadUserData called for", userId, role);
    if (!isSupabaseConfigured()) {
      console.error("Supabase not configured");
      return;
    }
    try {
      console.log(`Loading data for user: ${userId}, role: ${role}`);
      
      // 1. Fetch authenticated user profile
      let rawProfile = await fetchProfileWithRetry(userId);
      console.log("Raw profile fetched:", rawProfile);

      if (!rawProfile) {
        console.warn("Profile not found in database. Attempting auto-provisioning from metadata...");
        
        // AUTO-PROVISIONING logic for email-confirmed users who missed initial creation
        try {
          const { data: authUserRes } = await getSupabase().auth.getUser();
          const user = authUserRes?.user;
          
          if (user) {
            const meta = user.user_metadata || {};
            const fullName = meta.full_name || user.email?.split('@')[0] || 'NexaBank Customer';
            const uniqueAcctNum = meta.account_number || String(Math.floor(1000000000 + Math.random() * 9000000000));
            
            console.log("Provisioning new profile for:", fullName);
            
            const newProfile = {
              id: user.id,
              name: fullName,
              email: user.email,
              role: 'user',
              status: 'active',
              verification_status: 'verified',
              account_number: uniqueAcctNum,
              routing_number: '021000021'
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .upsert(newProfile)
              .select('*')
              .single();
              
            if (createError) throw createError;
            rawProfile = createdProfile;
            
            // Also provision wallet
            console.log("Provisioning wallet for:", fullName);
            await supabase.from('wallets').upsert({
              user_id: user.id,
              main_balance: 5000.00,
              available_balance: 5000.00,
              pending_balance: 0.00,
              savings_balance: 0.00
            });
            
            triggerToast("Your NexaBank ledger has been successfully provisioned.");
          }
        } catch (provisionErr) {
          console.error("Auto-provisioning failed:", provisionErr);
        }
      }

      if (!rawProfile) {
        console.error("Critical: Profile still missing after provisioning attempt.");
        throw new Error('Your custom profile does not exist in the ledger yet.');
      }
      
      const mappedProfile = mapProfileFromDB(rawProfile);

      // Fetch auth user metadata for resilient merge fallback
      try {
        const { data: authUserRes } = await getSupabase().auth.getUser();
        const meta = authUserRes?.user?.user_metadata || {};
        
        // Merge onboarding fields if database columns are missing or null
        if (!mappedProfile.middleName && meta.middle_name) mappedProfile.middleName = meta.middle_name;
        if (!mappedProfile.dateOfBirth && meta.date_of_birth) mappedProfile.dateOfBirth = meta.date_of_birth;
        if (!mappedProfile.gender && meta.gender) mappedProfile.gender = meta.gender;
        if (!mappedProfile.country && meta.country) mappedProfile.country = meta.country;
        if (!mappedProfile.stateProvince && meta.state_province) mappedProfile.stateProvince = meta.state_province;
        if (!mappedProfile.city && meta.city) mappedProfile.city = meta.city;
        if (!mappedProfile.zipPostalCode && meta.zip_postal_code) mappedProfile.zipPostalCode = meta.zip_postal_code;
        if (!mappedProfile.residentialAddress && meta.residential_address) mappedProfile.residentialAddress = meta.residential_address;
        if (!mappedProfile.employmentStatus && meta.employment_status) mappedProfile.employmentStatus = meta.employment_status;
        if (!mappedProfile.occupation && meta.occupation) mappedProfile.occupation = meta.occupation;
        if (!mappedProfile.employer && meta.employer) mappedProfile.employer = meta.employer;
        if (!mappedProfile.annualIncome && meta.annual_income) mappedProfile.annualIncome = Number(meta.annual_income);
        if (!mappedProfile.sourceFunds && meta.source_funds) mappedProfile.sourceFunds = meta.source_funds;
        if (!mappedProfile.govIdType && meta.gov_id_type) mappedProfile.govIdType = meta.gov_id_type;
        if (!mappedProfile.govIdNumber && meta.gov_id_number) mappedProfile.govIdNumber = meta.gov_id_number;
        if (!mappedProfile.nationalIdSsn && meta.national_id_ssn) mappedProfile.nationalIdSsn = meta.national_id_ssn;
        if (!mappedProfile.uploadedIdUrl && meta.uploaded_id_url) mappedProfile.uploadedIdUrl = meta.uploaded_id_url;
        if ((!mappedProfile.accountNumber || mappedProfile.accountNumber === 'NEXA-100492041-DEMO' || mappedProfile.accountNumber === '3049204109') && meta.account_number) {
          mappedProfile.accountNumber = meta.account_number;
        }
        if ((!mappedProfile.routingNumber || mappedProfile.routingNumber === '021000021-DEMO') && meta.routing_number) {
          mappedProfile.routingNumber = meta.routing_number;
        }
      } catch (authErr) {
        console.warn("Auth metadata loading bypassed:", authErr);
      }

      setCurrentUser(mappedProfile);

      // Access Control Guard
      if (mappedProfile.status === 'suspended') {
        getSupabase().auth.signOut();
        setCurrentUser(null);
        triggerToast('This NexaBank account has been suspended by administration compliance.');
        return;
      }

      // If non-admin attempts to view admin tab, redirect instantly
      if (mappedProfile.role !== 'admin' && currentTab === 'admin') {
        setCurrentTab('dashboard');
      }

      if (role === 'admin' || mappedProfile.role === 'admin') {
        // Admin authority queries
        const [pRes, wRes, tRes, dRes, wiRes, aRes, nRes] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('wallets').select('*'),
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('deposits').select('*').order('date', { ascending: false }),
          supabase.from('withdrawals').select('*').order('date', { ascending: false }),
          supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
          supabase.from('notifications').select('*').order('timestamp', { ascending: false })
        ]);

        if (pRes.data) setUsers(pRes.data.map(mapProfileFromDB));
        if (wRes.data) setWallets(wRes.data.map(mapWalletFromDB));
        if (tRes.data) setTransactions(tRes.data.map(mapTransactionFromDB));
        if (dRes.data) setDeposits(dRes.data.map(mapDepositFromDB));
        if (wiRes.data) setWithdrawals(wiRes.data.map(mapWithdrawalFromDB));
        if (aRes.data) setAuditLogs(aRes.data.map(mapAuditLogFromDB));
        if (nRes.data) setNotifications(nRes.data.map(mapNotificationFromDB));

      } else {
        // Regular User Sandbox queries
        const [wRes, tRes, dRes, wiRes, nRes] = await Promise.all([
          supabase.from('wallets').select('*').eq('user_id', userId).single(),
          supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('deposits').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('withdrawals').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('notifications').select('*').eq('user_id', userId).order('timestamp', { ascending: false })
        ]);

        if (wRes.data) setWallets([mapWalletFromDB(wRes.data)]);
        if (tRes.data) setTransactions(tRes.data.map(mapTransactionFromDB));
        if (dRes.data) setDeposits(dRes.data.map(mapDepositFromDB));
        if (wiRes.data) setWithdrawals(wiRes.data.map(mapWithdrawalFromDB));
        if (nRes.data) setNotifications(nRes.data.map(mapNotificationFromDB));
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(`Ledger sync error: ${err.message || err}`);
    }
  };

  // Synchronize on authentication changes
  useEffect(() => {
    setLoading(true);

    const checkSession = async () => {
      try {
        console.log("Checking session status...");
        
        // Log URL info for debugging email confirmations
        console.log("Current URL Hash:", window.location.hash ? "Present (Hidden for security)" : "None");
        console.log("Current Pathname:", window.location.pathname);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setCurrentUser(null);
          return;
        }

        if (session?.user) {
          console.log("Session found for user:", session.user.id);
          const rawProfile = await fetchProfileWithRetry(session.user.id);
          const mappedRole = rawProfile?.role || 'user';
          
          if (localStorage.getItem('is_new_registration') === 'true') {
            setShowWelcome(true);
            localStorage.removeItem('is_new_registration');
          }

          // Setup direct landing tabs depending on role
          if (mappedRole === 'admin') {
            setCurrentTab('dashboard');
          } else {
            setCurrentTab('dashboard');
          }

          await loadUserData(session.user.id, mappedRole);
        } else {
          setCurrentUser(null);
        }
      } catch (err: any) {
        console.error("Critical session check exception:", err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event detected:", event, session?.user?.id || 'No User');
      try {
        if (session?.user) {
          const rawProfile = await fetchProfileWithRetry(session.user.id);
          const mappedRole = rawProfile?.role || 'user';

          if (localStorage.getItem('is_new_registration') === 'true') {
            setShowWelcome(true);
            localStorage.removeItem('is_new_registration');
          }

          await loadUserData(session.user.id, mappedRole);
        } else {
          setCurrentUser(null);
        }
      } catch (err: any) {
        console.error("Auth state alteration exception caught safely:", err);
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Realtime Ticker Engine
  useEffect(() => {
    if (!currentUser) return;

    const handleChanges = () => {
      loadUserData(currentUser.id, currentUser.role);
    };

    const channel = supabase
      .channel('realtime-portal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, handleChanges)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // LOG OUT Action
  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentTab('dashboard');
    triggerToast('Securely disconnected from NexaBank ledgers.');
  };

  // USER ACTION: Request Direct Inbound Deposit
  const handleAddDeposit = async (amount: number, method: 'bank_wire' | 'crypto_usdt' | 'credit_card') => {
    if (!currentUser) return;
    const reference = `DEP-${method.toUpperCase().slice(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`;

    const { error: depError } = await supabase.from('deposits').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount,
      method,
      status: 'pending',
      reference
    });

    if (depError) {
      triggerToast(`Deposit request failed: ${depError.message}`);
      return;
    }

    // Update available wallet balances
    const currentWallet = wallets.find((w) => w.userId === currentUser.id);
    if (currentWallet) {
      await supabase.from('wallets').update({
        pending_balance: currentWallet.pendingBalance + amount
      }).eq('user_id', currentUser.id);
    }

    // Direct automated logs & messages
    await supabase.from('notifications').insert({
      user_id: currentUser.id,
      title: 'Pending Deposit Logged',
      message: `Your deposit of $${amount.toLocaleString()} via ${method.replace('_', ' ')} is submitted and pending clearance audit.`
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      action: 'Request Deposit',
      target_user_id: currentUser.id,
      target_user_name: currentUser.name,
      details: `User requested account credit of $${amount.toLocaleString()} via ${method.toUpperCase()}.`
    });

    triggerToast('Deposit request generated and submitted to compliance queue.');
  };

  // USER ACTION: Request Direct Outbound Payout / Withdrawal
  const handleAddWithdrawal = async (amount: number, method: 'bank_wire' | 'crypto_usdt', pin?: string) => {
    if (!currentUser) return 'System session missing.';
    const currentWallet = wallets.find((w) => w.userId === currentUser.id);
    if (!currentWallet) return 'Customer wallet not located.';

    if (amount > currentWallet.availableBalance) {
      return 'Insufficient funds.';
    }

    const reference = `WTH-${method.toUpperCase().slice(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Update checking wallet balances instantly
    const { error: walletError } = await supabase.from('wallets').update({
      available_balance: currentWallet.availableBalance - amount,
      pending_balance: currentWallet.pendingBalance + amount
    }).eq('user_id', currentUser.id);

    if (walletError) return walletError.message;

    // Add into withdrawals table
    await supabase.from('withdrawals').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount,
      method,
      status: 'pending',
      reference
    });

    // Notify & audit log
    await supabase.from('notifications').insert({
      user_id: currentUser.id,
      title: 'Outbound Payout Registered',
      message: `Withdrawal request for $${amount.toLocaleString()} registered. Available checking assets deducted and locked in pending audit clearance.`
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      action: 'Request Withdrawal',
      target_user_id: currentUser.id,
      target_user_name: currentUser.name,
      details: `User requested outbound payout of $${amount.toLocaleString()} via ${method.toUpperCase()}.`
    });

    triggerToast('Outbound discharge submitted. Funds deducted from available.');
    return null;
  };

  // USER ACTION: Direct Peer-to-Peer Transfer (Calls ACID-safe postgres function)
  const handleTransfer = async (recipientId: string, amount: number) => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase.rpc('transfer_funds', {
        p_recipient_id: recipientId,
        p_amount: amount
      });
      if (error) throw error;
      triggerToast(`Direct peer transfer settled! Handshake resolved.`);
    } catch (err: any) {
      triggerToast(`Transfer failed: ${err.message || err}`);
    }
  };

  // USER ACTION: Basic Profiles settings updates
  const handleUpdateUser = async (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) return;
    const dbUpdates = mapProfileToDB(updatedFields);
    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id);
    if (error) {
      triggerToast(`Update failed: ${error.message}`);
    } else {
      triggerToast('Profile settings synchronized.');
    }
  };

  // USER ACTION: Mark inbound alert notification as read
  const handleMarkNotifRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  // USER ACTION: Toggle virtual card frozen status
  const handleToggleCardFreeze = () => {
    setCardFrozen(prev => {
      const next = !prev;
      triggerToast(next ? 'Virtual card is now frozen.' : 'Virtual card is now unfrozen.');
      return next;
    });
  };

  // USER ACTION: Change card theme color
  const handleChangeCardColor = (color: 'emerald' | 'slate' | 'indigo' | 'amber') => {
    setCardColor(color);
    triggerToast(`Card color scheme updated to ${color.toUpperCase()}.`);
  };

  // USER ACTION: Add compounding goal funds from available balance
  const handleAddGoalFunds = async (amount: number) => {
    if (!currentUser || !activeUserWallet) return;
    if (amount > activeUserWallet.availableBalance) {
      triggerToast('Insufficient available funds.');
      return;
    }

    const { error } = await supabase.from('wallets').update({
      available_balance: activeUserWallet.availableBalance - amount,
      savings_balance: activeUserWallet.savingsBalance + amount
    }).eq('user_id', currentUser.id);

    if (error) {
      triggerToast(`Goal transfer failed: ${error.message}`);
    } else {
      triggerToast(`Deposited $${amount.toLocaleString()} into your Nexa Capital Growth goal!`);
    }
  };

  // USER ACTION: Withdraw goal funds back to available balance
  const handleWithdrawGoalFunds = async (amount: number) => {
    if (!currentUser || !activeUserWallet) return;
    if (amount > activeUserWallet.savingsBalance) {
      triggerToast('Insufficient vault reserves.');
      return;
    }

    const { error } = await supabase.from('wallets').update({
      available_balance: activeUserWallet.availableBalance + amount,
      savings_balance: activeUserWallet.savingsBalance - amount
    }).eq('user_id', currentUser.id);

    if (error) {
      triggerToast(`Vault transfer failed: ${error.message}`);
    } else {
      triggerToast(`Withdrew $${amount.toLocaleString()} back to your Checking Wallet.`);
    }
  };

  // USER ACTION: Simulate live sandbox transaction and register to real database
  const handleAddSimulatedTransaction = async (tx: Omit<Transaction, 'id' | 'date'>) => {
    if (!currentUser || !activeUserWallet) return;

    const dbType = tx.type === 'income' ? 'credit' : 'debit';
    const amount = tx.amount;

    let nextAvail = activeUserWallet.availableBalance;
    let nextMain = activeUserWallet.mainBalance;

    if (dbType === 'credit') {
      nextAvail += amount;
      nextMain += amount;
    } else {
      if (nextAvail < amount) {
        triggerToast('Transaction aborted: Insufficient funds in checking account.');
        return;
      }
      nextAvail -= amount;
      nextMain -= amount;
    }

    const { data: walletData, error: walletFetchError } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', currentUser.id)
      .single();

    if (walletFetchError || !walletData) {
      triggerToast('System mismatch: could not find matching customer ledger.');
      return;
    }

    // Insert completed transaction as a real transaction
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: currentUser.id,
      wallet_id: walletData.id,
      description: tx.description,
      amount,
      category: tx.category.toLowerCase(),
      type: dbType,
      status: 'completed',
      reference: `TX-NEX-${Math.floor(100000 + Math.random() * 900000)}`
    });

    if (txError) {
      triggerToast(`Transaction post failed: ${txError.message}`);
      return;
    }

    // Update the wallet balances in DB
    const { error: walletUpdateError } = await supabase.from('wallets').update({
      available_balance: nextAvail,
      main_balance: nextMain
    }).eq('user_id', currentUser.id);

    if (walletUpdateError) {
      triggerToast(`Ledger update failed: ${walletUpdateError.message}`);
    } else {
      triggerToast(`Simulated transaction "${tx.description}" processed & balances synchronized.`);
    }
  };

  // ADMIN ACTION: Direct Ledger credit approval
  const handleApproveDeposit = async (reqId: string) => {
    const req = deposits.find((d) => d.id === reqId);
    if (!req) return;

    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', req.userId).single();
    if (!walletData) return;

    // Direct atomic transactions updates in DB
    await supabase.from('deposits').update({ status: 'approved' }).eq('id', reqId);

    await supabase.from('wallets').update({
      main_balance: Number(walletData.main_balance) + req.amount,
      available_balance: Number(walletData.available_balance) + req.amount,
      pending_balance: Math.max(0, Number(walletData.pending_balance) - req.amount)
    }).eq('user_id', req.userId);

    await supabase.from('transactions').insert({
      user_id: req.userId,
      wallet_id: walletData.id,
      description: `Inbound Deposit settled (${req.method.replace('_', ' ')})`,
      amount: req.amount,
      category: 'deposit',
      type: 'credit',
      status: 'completed',
      reference: req.reference
    });

    await supabase.from('notifications').insert({
      user_id: req.userId,
      title: 'Deposit Approved & Cleared',
      message: `Your deposit request for $${req.amount.toLocaleString()} was approved and cleared into your available checking ledger.`
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || 'Admin',
      action: 'Approve Deposit',
      target_user_id: req.userId,
      target_user_name: req.userName,
      details: `Approved & settled inbound deposit request of $${req.amount.toLocaleString()} via SWIFT/BIC or TRC-20 clearance rules.`
    });

    triggerToast(`Inbound ledger deposit of $${req.amount.toLocaleString()} cleared.`);
  };

  // ADMIN ACTION: Reject deposit request
  const handleRejectDeposit = async (reqId: string) => {
    const req = deposits.find((d) => d.id === reqId);
    if (!req) return;

    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', req.userId).single();
    if (!walletData) return;

    await supabase.from('deposits').update({ status: 'rejected' }).eq('id', reqId);

    await supabase.from('wallets').update({
      pending_balance: Math.max(0, Number(walletData.pending_balance) - req.amount)
    }).eq('user_id', req.userId);

    await supabase.from('notifications').insert({
      user_id: req.userId,
      title: 'Deposit Rejected',
      message: `Your deposit request for $${req.amount.toLocaleString()} was rejected by administrative compliance audit. Please contact General Counsel.`
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || 'Admin',
      action: 'Reject Deposit',
      target_user_id: req.userId,
      target_user_name: req.userName,
      details: `Compliance rejection of inbound deposit request of $${req.amount.toLocaleString()} due to routing or KYC verify failures.`
    });

    triggerToast('Deposit request rejected.');
  };

  // ADMIN ACTION: Direct Ledger discharge approval
  const handleApproveWithdrawal = async (reqId: string) => {
    const req = withdrawals.find((w) => w.id === reqId);
    if (!req) return;

    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', req.userId).single();
    if (!walletData) return;

    await supabase.from('withdrawals').update({ status: 'approved' }).eq('id', reqId);

    await supabase.from('wallets').update({
      main_balance: Number(walletData.main_balance) - req.amount,
      pending_balance: Math.max(0, Number(walletData.pending_balance) - req.amount)
    }).eq('user_id', req.userId);

    await supabase.from('transactions').insert({
      user_id: req.userId,
      wallet_id: walletData.id,
      description: `Outbound Payout Settle (${req.method.replace('_', ' ')})`,
      amount: req.amount,
      category: 'withdrawal',
      type: 'debit',
      status: 'completed',
      reference: req.reference
    });

    await supabase.from('notifications').insert({
      user_id: req.userId,
      title: 'Withdrawal Cleared & Settle',
      message: `Your outbound payout of $${req.amount.toLocaleString()} was approved and discharged to your external banking/crypto routes.`
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || 'Admin',
      action: 'Approve Withdrawal',
      target_user_id: req.userId,
      target_user_name: req.userName,
      details: `Compliance approved outbound withdrawal settlement of $${req.amount.toLocaleString()} to external ledger destinations.`
    });

    triggerToast(`Withdrawal of $${req.amount.toLocaleString()} approved & discharged.`);
  };

  // ADMIN ACTION: Reject withdrawal request
  const handleRejectWithdrawal = async (reqId: string) => {
    const req = withdrawals.find((w) => w.id === reqId);
    if (!req) return;

    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', req.userId).single();
    if (!walletData) return;

    await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', reqId);

    await supabase.from('wallets').update({
      available_balance: Number(walletData.available_balance) + req.amount,
      pending_balance: Math.max(0, Number(walletData.pending_balance) - req.amount)
    }).eq('user_id', req.userId);

    await supabase.from('notifications').insert({
      user_id: req.userId,
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request for $${req.amount.toLocaleString()} was rejected. Blocked assets restored to your available checking ledger.`
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || 'Admin',
      action: 'Reject Withdrawal',
      target_user_id: req.userId,
      target_user_name: req.userName,
      details: `Compliance rejected outbound payout of $${req.amount.toLocaleString()} and restored balances back to client checking ledger.`
    });

    triggerToast('Withdrawal request rejected. Funds returned to checking.');
  };

  // ADMIN ACTION: Override details
  const handleUpdateUserDetails = async (userId: string, updates: Partial<UserProfile>) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const dbUpdates = mapProfileToDB(updates);
    await supabase.from('profiles').update(dbUpdates).eq('id', userId);

    let changedMessage = `Admin updated user details: `;
    Object.keys(updates).forEach((k) => {
      changedMessage += `[${k.toUpperCase()} set to ${updates[k as keyof UserProfile]}] `;
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || 'Admin',
      action: 'Override User Settings',
      target_user_id: userId,
      target_user_name: targetUser.name,
      details: changedMessage
    });

    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Compliance Policy Overwritten',
      message: `Administration general counsel updated your profile policies or compliance flags.`
    });

    triggerToast(`Compliance policies synchronized for ${targetUser.name}.`);
  };

  // ADMIN ACTION: Manual direct ledger corrections
  const handleAdjustWalletBalance = async (userId: string, actionType: 'credit' | 'debit' | 'bonus' | 'adjust', amount: number) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (!walletData) return;

    let nextMain = Number(walletData.main_balance);
    let nextAvail = Number(walletData.available_balance);

    if (actionType === 'credit' || actionType === 'bonus') {
      nextMain += amount;
      nextAvail += amount;
    } else if (actionType === 'debit') {
      nextMain = Math.max(0, nextMain - amount);
      nextAvail = Math.max(0, nextAvail - amount);
    } else if (actionType === 'adjust') {
      nextMain = amount;
      nextAvail = amount;
    }

    await supabase.from('wallets').update({
      main_balance: nextMain,
      available_balance: nextAvail
    }).eq('user_id', userId);

    await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: walletData.id,
      description: `Administrative adjustment: ${actionType.toUpperCase()}`,
      amount,
      category: actionType === 'bonus' ? 'bonus' : 'adjustment',
      type: (actionType === 'credit' || actionType === 'bonus') ? 'credit' : 'debit',
      status: 'completed',
      reference: `ADJ-LEDG-${Math.floor(10000 + Math.random() * 90000)}`
    });

    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Balance Ledger Overwrite',
      message: `Your balance ledger was administrative modified by general counsel: ${actionType.toUpperCase()} of $${amount.toLocaleString()}.`
    });

    await supabase.from('audit_logs').insert({
      actor_id: currentUser?.id,
      actor_name: currentUser?.name || 'Admin',
      action: 'Adjust Balance Override',
      target_user_id: userId,
      target_user_name: targetUser.name,
      details: `Admin executed manual balance adjustments of $${amount.toLocaleString()} with policy: ${actionType.toUpperCase()}`
    });

    triggerToast(`Ledger assets adjusted successfully.`);
  };

  // Process data mapped for active UI rendering
  const activeUserWallet = wallets.find((w) => w.userId === currentUser?.id);
  const activeUserTransactions = transactions.filter((t) => t.userId === currentUser?.id);
  const activeUserNotifs = notifications.filter((n) => n.userId === currentUser?.id);
  const unreadNotifsCount = activeUserNotifs.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest">Synchronizing ledgers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isDarkMode ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* WELCOME PORTFOLIO INSTANTIATION OVERLAY ANIMATION */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden select-none"
          >
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-lg space-y-8 text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center border border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)] relative"
              >
                <Shield className="w-8 h-8 text-white animate-pulse" />
              </motion.div>

              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display font-black text-2xl tracking-tight text-white uppercase"
                >
                  Handshake Completed Successfully
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-zinc-400 text-xs font-mono max-w-sm tracking-widest"
                >
                  CREATING LOCAL CLIENT LEDGER VAULTS...
                </motion.p>
              </div>

              {/* Sequential high tech visual checklists */}
              <div className="w-full max-w-xs space-y-2.5 font-mono text-[10px] text-zinc-500 text-left bg-zinc-900/60 border border-zinc-900/50 rounded-2xl p-4.5 shadow-xl">
                {[
                  { text: "RESOLVING SOVEREIGN ENCRYPTED KEY...", delay: 0.6 },
                  { text: "SYNCING WITH DECENTRALIZED CUSTODY NET...", delay: 1.2 },
                  { text: "CREDITING INTRODUCTORY ASSET BALANCE ($1,000.00)...", delay: 1.8 },
                  { text: "ESTABLISHING MAIN NET VAULT SAFEGUARDS...", delay: 2.4 }
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.delay }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-950 border border-emerald-900/80 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: step.delay + 0.3 }}
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-400 font-bold animate-bounce" />
                      </motion.div>
                    </div>
                    <span className="text-zinc-300 font-semibold">{step.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.2 }}
                className="pt-2"
              >
                <button
                  onClick={() => setShowWelcome(false)}
                  className="px-6 py-3 bg-white text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-white/10"
                >
                  Enter Dashboard Portal
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Toast Notification Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 max-w-sm w-full mx-4 text-left"
            id="global-toast-notif"
          >
            <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-wide leading-normal">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DebugConsole />

      {/* RENDER LOGIN / REGISTRATION GATE */}
      {!currentUser ? (
        <AuthScreens onLoginSuccess={(user) => {
          console.log("AuthScreens: onLoginSuccess called with", user);
          setCurrentTab('dashboard');
          loadUserData(user.id, 'user');
        }} />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row relative min-h-screen">
          
          {/* MOBILE SIDEBAR SLIDE-OVER DRAWER */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="fixed inset-0 bg-black z-40 lg:hidden"
                />
                
                {/* Slide out Panel */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className={`fixed top-0 bottom-0 left-0 w-72 z-50 lg:hidden border-r flex flex-col p-6 overflow-y-auto ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-slate-100 text-slate-900'
                  }`}
                >
                  {renderSidebarContent(true)}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* DESKTOP FIXED SIDEBAR */}
          <aside className={`hidden lg:flex fixed top-0 bottom-0 left-0 w-72 border-r flex-col p-6 overflow-y-auto ${
            isDarkMode ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-slate-150 text-slate-900'
          }`}>
            {renderSidebarContent(false)}
          </aside>

          {/* MAIN CONTAINER */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72 min-h-screen">
            
            {/* MOBILE TOP NAVIGATION BAR */}
            <div className={`lg:hidden flex items-center justify-between px-6 py-4 border-b ${
              isDarkMode ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition"
                  id="mobile-hamburger-trigger"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center border border-emerald-400 shrink-0">
                    <span className="font-display font-bold text-slate-950 text-sm leading-none">N</span>
                  </div>
                  <span className="font-display font-bold text-sm tracking-tight">NexaBank</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg font-mono text-[10px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentTime.split(' ')[0] || '00:00:00'}</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* DESKTOP STATUS BAR LEDGER INDICATOR */}
            <div className={`hidden lg:flex items-center justify-between px-8 py-4 border-b ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-900/50 text-zinc-400' : 'bg-white border-slate-100 text-slate-500'
            }`}>
              <div className="text-xs font-mono font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span>NEXABANK MAIN NET COMPLIANCE ACTIVE</span>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-850 px-3.5 py-1.5 rounded-xl font-mono text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                  <span>{currentTime || '00:00:00 UTC'}</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-150 dark:hover:bg-zinc-900 transition"
                  title="Toggle Light / Dark Mode"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* MAIN CONTENT SPACE WITH FADE-IN TRANSITION */}
            <main className="flex-1 p-6 lg:p-10 flex flex-col gap-8 max-w-7xl w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full text-left"
                >
                  {renderActiveTabContent()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* IMMUTABLE CUSTODY SYSTEM FOOTER */}
            <footer className={`py-6 text-center text-xs mt-auto border-t ${
              isDarkMode ? 'bg-zinc-950/20 border-zinc-900 text-zinc-500' : 'bg-white border-slate-100 text-slate-400'
            }`}>
              <p>© 2026 NexaBank Custody Technologies Inc. All rights reserved. Members FDIC and Equal Housing Lender.</p>
            </footer>
          </div>
        </div>
      )}

    </div>
  );

  // SIDEBAR RENDERER DEFINITION
  function renderSidebarContent(isMobile: boolean) {
    if (!currentUser) return null;
    const isAdmin = currentUser.role === 'admin';

    // Menu list configurations
    const userMenuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Compass },
      { id: 'accounts', label: 'Accounts', icon: Landmark },
      { id: 'deposit', label: 'Deposit', icon: ArrowUpRight },
      { id: 'withdraw', label: 'Withdraw', icon: ArrowDownRight },
      { id: 'transfer', label: 'Transfer', icon: Send },
      { id: 'services', label: 'Services', icon: Sparkles },
      { id: 'transactions', label: 'Transactions', icon: History },
      { id: 'cards', label: 'Cards', icon: CardIcon },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'support', label: 'Support', icon: HelpCircle }
    ];

    const adminMenuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'users', label: 'Users', icon: UsersIcon },
      { id: 'wallet_mgmt', label: 'Wallet Management', icon: WalletIcon },
      { id: 'deposits', label: 'Deposits', icon: ArrowUpRight, badge: deposits.filter(d => d.status === 'pending').length || undefined },
      { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownRight, badge: withdrawals.filter(w => w.status === 'pending').length || undefined },
      { id: 'transactions', label: 'Transactions', icon: History },
      { id: 'audit', label: 'Audit Logs', icon: Terminal },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const targetList = isAdmin ? adminMenuItems : userMenuItems;

    // Filter by search bar query
    const filteredList = targetList.filter((item) =>
      item.label.toLowerCase().includes(menuSearchQuery.toLowerCase())
    );

    const handleMenuSelection = (tabId: string) => {
      setCurrentTab(tabId);
      setSelectedAdminUser(null);
      if (isMobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    const handleLogOutAction = () => {
      supabase.auth.signOut().then(() => {
        setCurrentUser(null);
        setCurrentTab('dashboard');
        if (isMobile) {
          setIsMobileSidebarOpen(false);
        }
      });
    };

    return (
      <div className="flex flex-col h-full justify-between gap-6 select-none text-left">
        <div className="space-y-6">
          
          {/* Top Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500 flex items-center justify-center border border-emerald-400 shadow-sm shrink-0">
                <span className="font-display font-bold text-slate-950 text-lg leading-none">N</span>
              </div>
              <div>
                <span className="font-display font-bold text-base tracking-tight block">NexaBank</span>
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 block uppercase -mt-0.5">
                  {isAdmin ? 'Admin Terminal' : 'Custody Node'}
                </span>
              </div>
            </div>
            
            {isMobile && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User / Officer Info Segment */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
            isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50/50 border-slate-100 shadow-sm'
          }`}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200/50 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">{currentUser.name}</span>
              <span className="text-[10px] font-mono text-slate-400 block truncate -mt-0.5">{currentUser.email}</span>
              <span className="text-[8px] font-mono font-bold text-emerald-500 block uppercase mt-1">
                ● STATUS: {currentUser.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Search bar below profile section */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-100/50 dark:bg-zinc-900/40 border border-slate-200/40 dark:border-zinc-850 rounded-xl font-sans text-[11px] focus:outline-none"
            />
          </div>

          {/* Navigation link List */}
          <nav className="space-y-1">
            {filteredList.map((item) => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuSelection(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold leading-none ${
                      isActive ? 'bg-white text-indigo-600' : 'bg-indigo-50 dark:bg-zinc-900 text-indigo-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            {filteredList.length === 0 && (
              <p className="text-center py-4 text-[10px] text-slate-400 font-mono">NO RESULTS MATCHED</p>
            )}
          </nav>
        </div>

        {/* Pinned Logout Button */}
        <div className="pt-4 border-t border-slate-100/10">
          <button
            onClick={handleLogOutAction}
            className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition flex items-center gap-3"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Portal</span>
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE TAB ROUTER CONTENT DEFINITIONS
  function renderActiveTabContent() {
    if (!currentUser) return null;

    // Role Enforcement Block
    const isAdmin = currentUser.role === 'admin';

    // 1. ADMIN USER ROUTING SPACE
    if (isAdmin) {
      // Validate requested admin tab is compliance allowed
      const allowedAdminTabs = [
        'dashboard', 'users', 'wallet_mgmt', 'deposits', 'withdrawals', 
        'transactions', 'audit', 'reports', 'notifications', 'settings'
      ];
      if (!allowedAdminTabs.includes(currentTab)) {
        // Enforce redirect and 403 response locally by falling back to dashboard
        return (
          <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-left space-y-3">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              403 Unauthorized Access Redirect
            </h3>
            <p className="text-xs max-w-lg leading-relaxed">
              You requested an administrative interface segment that is either locked or currently undergoing regulatory review. We have authorized an immediate return redirect fallback.
            </p>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="px-4 py-2 bg-rose-500 text-white text-xs font-semibold rounded-xl"
            >
              Return Fallback Dashboard
            </button>
          </div>
        );
      }

      return (
        <AdminPanel
          adminUser={currentUser}
          usersList={users}
          walletsList={wallets}
          depositRequests={deposits.filter((d) => d.status === 'pending')}
          withdrawalRequests={withdrawals.filter((w) => w.status === 'pending')}
          auditLogs={auditLogs}
          transactionLogs={transactions}
          onApproveDeposit={handleApproveDeposit}
          onRejectDeposit={handleRejectDeposit}
          onApproveWithdrawal={handleApproveWithdrawal}
          onRejectWithdrawal={handleRejectWithdrawal}
          onUpdateUserDetails={handleUpdateUserDetails}
          onAdjustWalletBalance={handleAdjustWalletBalance}
          isDarkMode={isDarkMode}
          activeSubTab={currentTab}
          selectedUser={selectedAdminUser}
          onSelectUser={setSelectedAdminUser}
        />
      );
    }

    // 2. REGULAR USER ROUTING SPACE
    const allowedUserTabs = [
      'dashboard', 'accounts', 'deposit', 'withdraw', 'transfer', 'transactions', 
      'cards', 'notifications', 'profile', 'security', 'settings', 'support'
    ];
    if (!allowedUserTabs.includes(currentTab)) {
      // Security role gate - instantly fallback to dashboard if they request admin paths
      return (
        <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-left space-y-3">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            403 Unauthorized Administrative Route Locked
          </h3>
          <p className="text-xs max-w-lg leading-relaxed">
            NexaBank central rules restrict access to this node directory. Immediate compliance redirect fallback active.
          </p>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-4 py-2 bg-rose-500 text-white text-xs font-semibold rounded-xl"
          >
            Acknowledge & Return Dashboard
          </button>
        </div>
      );
    }

    // Render respective screens
    switch (currentTab) {
      case 'dashboard':
        return activeUserWallet ? (
          <DashboardOverview
            user={currentUser}
            wallet={activeUserWallet}
            transactions={activeUserTransactions}
            onNavigate={(tab) => {
              if (tab === 'deposit_withdraw') {
                setCurrentTab('deposit');
              } else {
                setCurrentTab(tab);
              }
            }}
            isDarkMode={isDarkMode}
          />
        ) : null;

      case 'accounts':
        return activeUserWallet ? (
          <div className="space-y-8 text-left">
            {/* Header */}
            <div>
              <span className="text-indigo-500 font-mono text-[10px] font-bold uppercase tracking-widest block mb-1">Custody Assets</span>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Liquid Reserves Ledger</h2>
              <p className="text-xs text-slate-500 mt-1">Configure checking and savings vault allocations, review wire routing numbers, and transfer assets instantly.</p>
            </div>

            {/* Asset balances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Checking Available Balance</span>
                <span className="text-2xl font-bold font-mono text-indigo-500 mt-2 block">${activeUserWallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] font-mono text-slate-400 block mt-2">ACCOUNT # 9021-4820-221</span>
              </div>

              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Savings Vault Reserves</span>
                <span className="text-2xl font-bold font-mono text-emerald-500 mt-2 block">${activeUserWallet.savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] font-mono text-slate-400 block mt-2">ROUTING ABA 021000021</span>
              </div>

              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} flex flex-col justify-between`}>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Compounding APY</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-white mt-1 block">+4.85% Compound interest</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-500 font-bold block mt-2 uppercase">● COMPLIANCE ASSURED</span>
              </div>
            </div>

            {/* Bidirectional vault allocation form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Form (7 columns) */}
              <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} flex flex-col justify-between`}>
                <div>
                  <h3 className="font-display font-semibold text-sm mb-1">Transfer assets between Available & Savings Vault</h3>
                  <p className="text-xs text-slate-500">Allocation transfers are settled immediately inside NexaBank without ledger penalties.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const inputEl = document.getElementById('vault-transfer-amount-input') as HTMLInputElement;
                    const selectEl = document.getElementById('vault-transfer-dir-select') as HTMLSelectElement;
                    const val = parseFloat(inputEl?.value);
                    if (isNaN(val) || val <= 0) {
                      triggerToast('Specify a valid numerical transfer size.');
                      return;
                    }
                    if (selectEl?.value === 'to_vault') {
                      handleAddGoalFunds(val);
                    } else {
                      handleWithdrawGoalFunds(val);
                    }
                    if (inputEl) inputEl.value = '';
                  }}
                  className="space-y-5 mt-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Directional Path</label>
                      <select id="vault-transfer-dir-select" className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs font-semibold">
                        <option value="to_vault">Checking Available → Savings Vault</option>
                        <option value="to_checking">Savings Vault → Checking Available</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Transfer Value (USD)</label>
                      <input id="vault-transfer-amount-input" type="number" step="0.01" placeholder="e.g. 500.00" className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs font-mono font-bold" />
                    </div>
                  </div>

                  <button type="submit" className="px-5 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold rounded-xl text-xs uppercase cursor-pointer">
                    Authorize Allocation Settle
                  </button>
                </form>
              </div>

              {/* ABA specs card (5 columns) */}
              <div className={`lg:col-span-5 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-150 shadow-sm'} space-y-4`}>
                <h4 className="font-display font-semibold text-xs flex items-center gap-1.5"><Info className="w-4 h-4 text-indigo-500" /> Swift & Routing Specs</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Use the official wire details below to configure inbound direct deposits or international SWIFT wire transfers into NexaBank.
                </p>
                
                <div className="p-4 bg-slate-100/50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-2xl text-[11px] font-mono space-y-2 text-slate-500">
                  <div className="flex justify-between">
                    <span>ABA Routing speed:</span>
                    <strong className="text-slate-700 dark:text-zinc-300">Fast Wire (2h)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Nexa SWIFT code:</span>
                    <strong className="text-slate-700 dark:text-zinc-300">NEXABANKUS1A</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Asset standard:</span>
                    <strong className="text-slate-700 dark:text-zinc-300">TRC-20, USD, EUR</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case 'deposit':
        return activeUserWallet ? (
          <DepositWithdraw
            user={currentUser}
            wallet={activeUserWallet}
            onAddDeposit={handleAddDeposit}
            onAddWithdrawal={handleAddWithdrawal}
            isDarkMode={isDarkMode}
          />
        ) : null;

      case 'withdraw':
        return activeUserWallet ? (
          <DepositWithdraw
            user={currentUser}
            wallet={activeUserWallet}
            onAddDeposit={handleAddDeposit}
            onAddWithdrawal={handleAddWithdrawal}
            isDarkMode={isDarkMode}
          />
        ) : null;

      case 'transfer':
        return activeUserWallet ? (
          <TransferFunds
            user={currentUser}
            wallet={activeUserWallet}
            usersList={users}
            onTransfer={handleTransfer}
            isDarkMode={isDarkMode}
          />
        ) : null;

      case 'services':
        return <Services isDarkMode={isDarkMode} />;

      case 'transactions':
        return (
          <TransactionsHistory
            transactions={activeUserTransactions}
            isDarkMode={isDarkMode}
          />
        );

      case 'cards':
        return activeUserWallet ? (() => {
          const card: CreditCard = {
            number: '4532781290114562',
            holder: currentUser.name,
            expiry: '12/29',
            cvv: '382',
            isFrozen: cardFrozen,
            color: cardColor,
            balance: activeUserWallet.availableBalance,
            limit: 25000.00
          };

          const goal: SavingsGoal = {
            name: 'Nexa Capital Growth',
            current: activeUserWallet.savingsBalance,
            target: 10000.00,
            category: 'Asset Compound'
          };

          const simulatorTransactions: Transaction[] = activeUserTransactions.map((t) => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            date: new Date(t.date).toLocaleDateString(),
            category: t.category.charAt(0).toUpperCase() + t.category.slice(1),
            type: t.type === 'credit' ? 'income' : 'expense',
            status: t.status
          }));

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className="lg:col-span-2 flex flex-col gap-8">
                <InteractiveCard 
                  card={card} 
                  onToggleFreeze={handleToggleCardFreeze} 
                  onChangeColor={handleChangeCardColor} 
                />
                <TransactionSimulator 
                  transactions={simulatorTransactions} 
                  onAddTransaction={handleAddSimulatedTransaction} 
                  selectedAccount="checking" 
                />
              </div>
              <div>
                <GoalTracker 
                  goal={goal} 
                  onAddFunds={handleAddGoalFunds} 
                  checkingBalance={activeUserWallet.availableBalance} 
                />
              </div>
            </div>
          );
        })() : null;

      case 'notifications':
        return (
          <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} text-left`}>
            <div className="mb-6">
              <h2 className="text-lg font-bold font-display">Ledger Alerts & Announcements</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review alerts dispatched automatically or manually by institutional compliance.</p>
            </div>

            <div className="flex flex-col gap-3">
              {activeUserNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkNotifRead(notif.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    notif.read 
                      ? 'bg-slate-100/10 border-slate-200/20 text-slate-400' 
                      : 'bg-indigo-500/5 border-indigo-500/10 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h4 className="text-xs font-bold font-display flex items-center gap-1.5">
                      {!notif.read && <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full shrink-0" />}
                      {notif.title}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400 font-medium shrink-0">{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-zinc-400">{notif.message}</p>
                </div>
              ))}
              {activeUserNotifs.length === 0 && (
                <p className="text-center py-12 text-slate-500 font-mono text-xs">NO RECORDED CUSTODY ALERTS</p>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <SettingsPanel
            user={currentUser}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onUpdateUser={handleUpdateUser}
            onAddAuditLog={(act, det) => {}}
            activeSection="profile"
          />
        );

      case 'security':
        return (
          <SettingsPanel
            user={currentUser}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onUpdateUser={handleUpdateUser}
            onAddAuditLog={(act, det) => {}}
            activeSection="security"
          />
        );

      case 'settings':
        return (
          <SettingsPanel
            user={currentUser}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onUpdateUser={handleUpdateUser}
            onAddAuditLog={(act, det) => {}}
            activeSection="settings"
          />
        );

      case 'support':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            {/* Left FAQ Accordions (7 cols) */}
            <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}>
              <div>
                <h3 className="font-display font-semibold text-base mb-1">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500">Find answers to frequently asked digital banking questions.</p>
              </div>

              <div className="space-y-3">
                {[
                  { q: 'How do I fund my NexaBank Checking account?', a: 'Navigate to the "Deposit" tab on the sidebar, choose your payment method (SWIFT Wire or Crypto Tether TRC-20), specify your amount, and submit your request. Compliance will review and process your deposit securely.' },
                  { q: 'Can I transfer funds bidirectional with Savings Vault?', a: 'Yes! Navigate to the "Accounts" tab on your left navigation menu. You can allocate funds from Available checking into Savings, or return them immediately without penalties.' },
                  { q: 'What should I do if my withdrawals are locked?', a: 'In compliance with banking guidelines, payouts may be temporarily locked for verification. If so, a withdrawal PIN challenge is required. Contact general counsel or log a ticket on the right.' }
                ].map((faq, idx) => (
                  <details key={idx} className="group p-4 bg-slate-100/30 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-850 cursor-pointer">
                    <summary className="text-xs font-bold font-display list-none flex justify-between items-center text-slate-800 dark:text-zinc-200">
                      <span>{faq.q}</span>
                      <span className="text-indigo-500 group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <p className="text-[11px] leading-relaxed text-slate-500 mt-2.5 pt-2.5 border-t border-slate-200/20">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Right Ticket submission (5 cols) */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}>
              <div>
                <h3 className="font-display font-semibold text-xs uppercase text-slate-400 block tracking-wider">Log support ticket</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Submit custom messages to our institutional support team.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const subEl = document.getElementById('ticket-subj') as HTMLInputElement;
                  const sevEl = document.getElementById('ticket-sev') as HTMLSelectElement;
                  const msgEl = document.getElementById('ticket-msg') as HTMLTextAreaElement;
                  if (!subEl?.value || !msgEl?.value) {
                    triggerToast('Please complete subject and message.');
                    return;
                  }
                  handleCreateSupportTicket(subEl.value, sevEl.value, msgEl.value);
                  subEl.value = '';
                  msgEl.value = '';
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono font-semibold text-slate-400">Subject</label>
                    <input id="ticket-subj" required type="text" placeholder="e.g. Card freezing" className="w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-850 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono font-semibold text-slate-400">Priority</label>
                    <select id="ticket-sev" className="w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-850 rounded-xl">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono font-semibold text-slate-400">Context Query Message</label>
                  <textarea id="ticket-msg" required rows={3} placeholder="Provide details..." className="w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-850 rounded-xl" />
                </div>

                <button type="submit" className="w-full py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer">
                  Transmit ticket
                </button>
              </form>

              {/* Support ticket list */}
              <div className="pt-4 border-t border-slate-100/10 space-y-3">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Logged Tickets ({supportTickets.length})</span>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {supportTickets.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-100/30 dark:bg-zinc-950 border border-slate-200/30 dark:border-zinc-850 rounded-xl text-xs font-mono">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-slate-800 dark:text-zinc-200 truncate max-w-[120px]">{t.subject}</strong>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          t.status === 'open' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.message}</p>
                      <span className="text-[8px] text-slate-400 block mt-1.5">{t.date} | ID: {t.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center text-center py-12 px-6 max-w-md mx-auto space-y-6">
            <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-3xl text-indigo-500 shadow-xl">
              <Compass className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Directory Segment Not Located</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The requested ledger coordinate is not currently active or compliance-approved. We have safe redirects ready to assist you.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Back to Safe Dashboard
            </button>
          </div>
        );
    }
  }

  // Support ticket logging helper inside App scope
  const handleCreateSupportTicket = (subject: string, severity: string, message: string) => {
    const newId = `ST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: newId,
      subject,
      message,
      severity,
      date: new Date().toLocaleDateString(),
      status: 'open' as const
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    triggerToast(`Support ticket ${newId} logged successfully.`);
    
    // Simulate automated resolution
    setTimeout(() => {
      setSupportTickets((prev) => 
        prev.map((t) => t.id === newId ? { ...t, status: 'resolved' as const } : t)
      );
      triggerToast(`Nexa Compliance Sentry automatically resolved Support ticket ${newId}.`);
    }, 4500);
  };
}
