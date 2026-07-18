import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, Shield, ClipboardList, Sparkles, Check, X, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Search, Award, RefreshCw, Layers, BarChart3, 
  Bell, Settings, FileText, DollarSign, Wallet as WalletIcon, HelpCircle, Landmark, Terminal,
  Plus, Send, Activity, ShieldAlert
} from 'lucide-react';
import { UserProfile, Wallet, DepositRequest, WithdrawalRequest, AuditLog, BankTransaction } from '../types';
import { getSupabase } from '../lib/supabase';

interface AdminPanelProps {
  adminUser: UserProfile;
  usersList: UserProfile[];
  walletsList: Wallet[];
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  auditLogs: AuditLog[];
  transactionLogs: BankTransaction[];
  onApproveDeposit: (reqId: string) => void;
  onRejectDeposit: (reqId: string) => void;
  onApproveWithdrawal: (reqId: string) => void;
  onRejectWithdrawal: (reqId: string) => void;
  onRequireDepositWithdrawal?: (reqId: string, amount: number) => void;
  onUpdateUserDetails: (userId: string, updates: Partial<UserProfile>) => void;
  onAdjustWalletBalance: (userId: string, actionType: 'credit' | 'debit' | 'bonus' | 'adjust', amount: number) => void;
  isDarkMode: boolean;
  activeSubTab: string;
  selectedUser: UserProfile | null;
  onSelectUser: (user: UserProfile | null) => void;
}

export default function AdminPanel({
  adminUser,
  usersList,
  walletsList,
  depositRequests,
  withdrawalRequests,
  auditLogs,
  transactionLogs,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onRequireDepositWithdrawal,
  onUpdateUserDetails,
  onAdjustWalletBalance,
  isDarkMode,
  activeSubTab,
  selectedUser,
  onSelectUser
}: AdminPanelProps) {
  const supabase = getSupabase();
  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit' | 'bonus' | 'adjust'>('credit');
  const [adjustSuccess, setAdjustSuccess] = useState('');
  const [adjustError, setAdjustError] = useState('');

  // Profile Edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCryptoWallet, setEditCryptoWallet] = useState('');
  const [editMsg, setEditMsg] = useState('');

  // Broadcast Notification Fields
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetUserId, setNotifTargetUserId] = useState('all');
  const [notifSuccess, setNotifSuccess] = useState('');
  
  // Require Deposit Inputs
  const [requireDepositValues, setRequireDepositValues] = useState<Record<string, string>>({});

  // Admin Compliance overrides
  const [globalLock, setGlobalLock] = useState(false);
  const [maxTransferLimit, setMaxTransferLimit] = useState('50000');
  const [complianceLevel, setComplianceLevel] = useState('standard');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Live Notification Feed
  const [liveEvents, setLiveEvents] = useState<{id: string, text: string, time: string}[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  useEffect(() => {
    const channel = supabase.channel('admin_live_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const newProfile = payload.new as any;
        setLiveEvents(prev => [{
          id: Date.now().toString(),
          text: `NEW REGISTRATION: ${newProfile.name || newProfile.email} just created an account.`,
          time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Calculations for Admin Dashboard Overview
  const totalUsers = usersList.filter(u => u.role !== 'admin').length;
  const totalChecking = walletsList.reduce((sum, w) => sum + (w.availableBalance || 0), 0);
  const totalSavings = walletsList.reduce((sum, w) => sum + (w.savingsBalance || 0), 0);
  const totalAssets = totalChecking + totalSavings;
  const pendingDepositsCount = depositRequests.length;
  const pendingWithdrawalsCount = withdrawalRequests.length;

  const totalDepositedAmount = depositRequests.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawnAmount = withdrawalRequests.reduce((sum, w) => sum + w.amount, 0);

  // Filter regular users list for management
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && u.role !== 'admin';
  });

  const handleSelectUser = (user: UserProfile) => {
    onSelectUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditCryptoWallet(user.assignedCryptoWallet || '');
    setAdjustSuccess('');
    setAdjustError('');
    setEditMsg('');
  };

  const handleSaveProfileEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    onUpdateUserDetails(selectedUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      assignedCryptoWallet: editCryptoWallet
    });
    setEditMsg('User portfolio profile successfully overridden.');
    setTimeout(() => setEditMsg(''), 3000);
  };

  // Status adjustments toggles
  const handleToggleSuspend = (user: UserProfile) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    onUpdateUserDetails(user.id, { status: nextStatus });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, status: nextStatus });
    }
  };

  const handleToggleFreeze = (user: UserProfile) => {
    const nextStatus = user.status === 'frozen' ? 'active' : 'frozen';
    onUpdateUserDetails(user.id, { status: nextStatus });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, status: nextStatus });
    }
  };

  const handleToggleHold = (user: UserProfile) => {
    const nextStatus = user.status === 'hold' ? 'active' : 'hold';
    onUpdateUserDetails(user.id, { status: nextStatus });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, status: nextStatus });
    }
  };

  const handleToggleUpgraded = (user: UserProfile) => {
    const nextVal = !user.isUpgraded;
    onUpdateUserDetails(user.id, { isUpgraded: nextVal });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, isUpgraded: nextVal });
    }
  };

  const handleToggleWithdrawalsLock = (user: UserProfile) => {
    const nextVal = !user.withdrawalsLocked;
    onUpdateUserDetails(user.id, { withdrawalsLocked: nextVal });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, withdrawalsLocked: nextVal });
    }
  };

  const handleTogglePinEnforce = (user: UserProfile) => {
    const nextVal = !user.withdrawalPinRequired;
    onUpdateUserDetails(user.id, { withdrawalPinRequired: nextVal });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, withdrawalPinRequired: nextVal });
    }
  };

  const handleGeneratePin = (user: UserProfile) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    onUpdateUserDetails(user.id, { withdrawalPin: newPin });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, withdrawalPin: newPin });
    }
    // Record audit log directly
    getSupabase().from('audit_logs').insert({
      actor_id: adminUser.id,
      actor_name: adminUser.name,
      action: 'Generate Withdrawal PIN',
      target_user_id: user.id,
      target_user_name: user.name,
      details: `Generated secure numerical withdrawal authorization PIN (${newPin}) for user.`
    }).then(() => {});
    alert(`[ADMIN COMPLIANCE] Generated secure withdrawal PIN for ${user.name}: ${newPin}`);
  };

  const handleResetPin = (user: UserProfile) => {
    onUpdateUserDetails(user.id, { withdrawalPin: '0000' });
    if (selectedUser?.id === user.id) {
      onSelectUser({ ...selectedUser, withdrawalPin: '0000' });
    }
    // Record audit log directly
    getSupabase().from('audit_logs').insert({
      actor_id: adminUser.id,
      actor_name: adminUser.name,
      action: 'Reset PIN',
      target_user_id: user.id,
      target_user_name: user.name,
      details: 'Reset withdrawal PIN to standard regulatory fallback default (0000).'
    }).then(() => {});
    alert(`[ADMIN ACTION] Reset withdrawal PIN for ${user.name} to fallback code: 0000`);
  };

  // Adjust Wallet Balance submit
  const handleAdjustBalanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAdjustSuccess('');
    setAdjustError('');
    if (!selectedUser) return;

    const parsed = parseFloat(adjustAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setAdjustError('Enter a valid positive numerical amount.');
      return;
    }

    onAdjustWalletBalance(selectedUser.id, adjustType, parsed);
    setAdjustSuccess(`Ledger adjusted! Executed ${adjustType.toUpperCase()} of $${parsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`);
    setAdjustAmount('');
  };

  // Helper to get matching wallet
  const getUserWallet = (userId: string) => {
    return walletsList.find((w) => w.userId === userId);
  };

  // Broadcast custom alert
  const handleBroadcastNotification = async (e: FormEvent) => {
    e.preventDefault();
    setNotifSuccess('');
    if (!notifTitle || !notifMessage) {
      alert('Please fill out both the alert title and context message.');
      return;
    }

    try {
      if (notifTargetUserId === 'all') {
        const regularUsers = usersList.filter(u => u.role !== 'admin');
        const inserts = regularUsers.map(u => ({
          user_id: u.id,
          title: notifTitle,
          message: notifMessage,
          read: false
        }));

        const { error } = await getSupabase().from('notifications').insert(inserts);
        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          actor_id: adminUser.id,
          actor_name: adminUser.name,
          action: 'Global Broadcast Alert',
          target_user_id: 'all',
          target_user_name: 'All Registered Portfolios',
          details: `Dispatched global notification broadcast: "${notifTitle}"`
        });

        setNotifSuccess(`Broadcast dispatched successfully to ${regularUsers.length} active customer portfolios.`);
      } else {
        const targetUser = usersList.find(u => u.id === notifTargetUserId);
        if (!targetUser) return;

        const { error } = await getSupabase().from('notifications').insert({
          user_id: targetUser.id,
          title: notifTitle,
          message: notifMessage,
          read: false
        });
        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          actor_id: adminUser.id,
          actor_name: adminUser.name,
          action: 'Direct Notification',
          target_user_id: targetUser.id,
          target_user_name: targetUser.name,
          details: `Sent custom alert: "${notifTitle}" to user directly.`
        });

        setNotifSuccess(`Direct portfolio notice successfully transmitted to ${targetUser.name}.`);
      }

      setNotifTitle('');
      setNotifMessage('');
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message || err}`);
    }
  };

  // Save admin system configurations
  const handleSaveSystemSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    
    // Log audit
    await supabase.from('audit_logs').insert({
      actor_id: adminUser.id,
      actor_name: adminUser.name,
      action: 'Update Central Parameters',
      target_user_id: 'system',
      target_user_name: 'System Ledger',
      details: `Updated central rules: Global lock ${globalLock ? 'ENFORCED' : 'OFF'}, max transfer limit $${Number(maxTransferLimit).toLocaleString()}, compliance mode: ${complianceLevel.toUpperCase()}.`
    });

    setSettingsSuccess('Central ledger settings updated and synchronized successfully.');
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  return (
    <div className="w-full text-left font-sans">
      <AnimatePresence mode="wait">
        
        {/* TAB 1: ADMIN DASHBOARD OVERVIEW */}
        {activeSubTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <span className="text-emerald-500 font-mono text-[10px] font-bold uppercase tracking-widest block mb-1">Central Intelligence Terminal</span>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
              <p className="text-xs text-slate-500 mt-1">Authoritative oversight of aggregate customer reserves, transaction logs, and security controls.</p>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} flex items-center gap-4`}>
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Active Customers</span>
                  <span className="text-xl font-bold font-mono text-slate-800 dark:text-white">{totalUsers}</span>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} flex items-center gap-4`}>
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Reserves Aggregate</span>
                  <span className="text-xl font-bold font-mono text-slate-800 dark:text-white">${totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} flex items-center gap-4`}>
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Pending Settlements</span>
                  <span className="text-xl font-bold font-mono text-slate-800 dark:text-white">{pendingDepositsCount + pendingWithdrawalsCount}</span>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} flex items-center gap-4`}>
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Core Node Status</span>
                  <span className="text-xs font-bold text-emerald-500 tracking-wide block mt-1 uppercase">● Regulatory SECURE</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Chart & Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Asset Composition Chart (8 columns) */}
              <div className={`lg:col-span-8 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} space-y-6`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-semibold text-sm">Reserves Allocation Report</h3>
                    <p className="text-[11px] text-slate-400">Total liabilities representation between checking accounts and savings vaults.</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" /> Checking Wallet</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Savings Vault</span>
                  </div>
                </div>

                {/* SVG Visualizer */}
                <div className="h-52 w-full flex items-end gap-1.5 pb-2 pt-6">
                  {/* Checking portion */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div 
                      style={{ height: `${(totalChecking / (totalAssets || 1)) * 100}%` }} 
                      className="w-full bg-indigo-500/90 hover:bg-indigo-400 transition-all rounded-t-2xl relative group cursor-pointer min-h-[10px]"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white rounded-lg px-2 py-1 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                        Checking: ${totalChecking.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate w-full text-center">Checking Reserves</span>
                  </div>

                  {/* Savings portion */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div 
                      style={{ height: `${(totalSavings / (totalAssets || 1)) * 100}%` }} 
                      className="w-full bg-emerald-500/90 hover:bg-emerald-400 transition-all rounded-t-2xl relative group cursor-pointer min-h-[10px]"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white rounded-lg px-2 py-1 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                        Savings: ${totalSavings.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate w-full text-center">Vault Reserves</span>
                  </div>
                </div>
              </div>

              {/* Mini audit logs (4 columns) */}
              <div className={`lg:col-span-4 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} space-y-4`}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/10">
                  <h3 className="font-display font-semibold text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-500" /> Recent Audits
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Live Sentry</span>
                </div>

                <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-left space-y-1">
                      <span className="text-[9px] font-mono text-indigo-400 font-bold block">{log.action.toUpperCase()}</span>
                      <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-normal truncate">{log.details}</p>
                      <span className="text-[8px] font-mono text-slate-500 block">{log.timestamp}</span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-center py-6 text-slate-500 font-mono text-[10px]">NO RECENT SYSTEM TRAILS</p>
                  )}
                </div>
              </div>

              {/* Live Real-time Registration Feed (12 columns) */}
              <div className={`lg:col-span-12 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'} space-y-4`}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/10">
                  <h3 className="font-display font-semibold text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-500 animate-pulse" /> Live Registration Feed
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Real-Time Stream</span>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {liveEvents.length > 0 ? liveEvents.map(evt => (
                    <div key={evt.id} className="flex gap-3 text-left items-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850">
                      <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-800 dark:text-zinc-200 font-medium">{evt.text}</p>
                        <span className="text-[9px] font-mono text-slate-400">{evt.time}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-8 text-slate-500 font-mono text-[10px]">WAITING FOR NEW REGISTRATIONS...</p>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB: INBOUND COMPLIANCE QUEUE */}
        {activeSubTab === 'inbound_requests' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
          >
            <div>
              <span className="text-indigo-500 font-mono text-[10px] font-bold uppercase tracking-widest block mb-1">Compliance & Auditing Division</span>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Inbound Compliance Queue</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Unified real-time ledger of all incoming Sovereign KYC verifications and annual tax filings awaiting compliance team review.
              </p>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left space-y-6`}>
              <div className="flex items-center justify-between border-b border-slate-100/10 pb-4">
                <h3 className="font-display font-bold text-lg">Pending Inbound Submissions</h3>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full font-mono text-[10px] font-bold animate-pulse">
                  ● AUDIT QUEUE ACTIVE
                </span>
              </div>

              {/* Table List of Inbound Requests */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-zinc-800 text-slate-400 font-mono text-[9px] uppercase font-bold text-left">
                      <th className="pb-3 font-semibold">User details</th>
                      <th className="pb-3 font-semibold">Submission type</th>
                      <th className="pb-3 font-semibold">Date submitted</th>
                      <th className="pb-3 font-semibold">Compliance level</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const list: any[] = [];
                      usersList.forEach(u => {
                        if (u.verificationStatus === 'pending') {
                          let subDate = u.joinedDate || new Date().toISOString();
                          try {
                            if (u.uploadedIdUrl) {
                              const kyc = JSON.parse(u.uploadedIdUrl);
                              if (kyc && kyc.submittedAt) {
                                subDate = kyc.submittedAt;
                              }
                            }
                          } catch(e) {}
                          list.push({
                            id: `kyc-${u.id}`,
                            userId: u.id,
                            user: u,
                            type: 'Sovereign KYC ID Verification',
                            submittedAt: subDate,
                            status: 'Pending'
                          });
                        }
                        if (u.sourceFunds) {
                          try {
                            const tax = JSON.parse(u.sourceFunds);
                            if (tax && tax.taxFilingStatus === 'pending') {
                              list.push({
                                id: `tax-${u.id}`,
                                userId: u.id,
                                user: u,
                                type: 'Annual Tax Filing & Limit Upgrade',
                                submittedAt: tax.submittedAt || new Date().toISOString(),
                                status: 'Pending'
                              });
                            }
                          } catch (e) {
                            // ignore parsing error
                          }
                        }
                      });

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-150 dark:border-zinc-850 rounded-2xl">
                              NO PENDING INBOUND COMPLIANCE SUBMISSIONS LOGGED
                            </td>
                          </tr>
                        );
                      }

                      // Sort by submittedAt chronologically
                      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

                      return list.map(req => (
                        <tr key={req.id} className="border-b border-slate-100/10 hover:bg-slate-50/5 transition">
                          <td className="py-4 flex items-center gap-3">
                            <img
                              src={req.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.user.name}`}
                              alt={req.user.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full border border-slate-200/50 object-cover shrink-0"
                            />
                            <div>
                              <span className="font-bold block text-slate-800 dark:text-zinc-100">{req.user.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">{req.user.email}</span>
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-slate-700 dark:text-zinc-300">
                            {req.type}
                          </td>
                          <td className="py-4 font-mono text-slate-400">
                            {new Date(req.submittedAt).toLocaleString()}
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold uppercase">
                              Level 2 Audit Required
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase transition hover:scale-102 active:scale-98"
                            >
                              Review & Audit
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT */}
        {activeSubTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {selectedUser ? (
              /* DETAILED MEMBER CONSOLE */
              <div className="space-y-6">
                <button
                  onClick={() => onSelectUser(null)}
                  className="px-3 py-1.5 self-start bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 rounded-xl text-xs font-semibold border border-slate-200/50 dark:border-zinc-850 hover:scale-105 transition"
                >
                  ← Back to Customer Index
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Info Card & Edit (7 columns) */}
                  <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-6`}>
                    <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100/10">
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="w-12 h-12 rounded-full object-cover border border-slate-200/50" />
                      <div>
                        <h3 className="font-display font-bold text-base flex items-center gap-1.5">
                          {selectedUser.name}
                          {selectedUser.isUpgraded && <Award className="w-4 h-4 text-indigo-500" />}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">Customer ID: {selectedUser.id}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfileEdit} className="space-y-4 text-xs">
                      <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block">Edit General Data</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] uppercase font-mono text-slate-500">Legal Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-850 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-mono text-slate-500">Registered Email</label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-850 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[9px] uppercase font-mono text-slate-500">Assigned Crypto Deposit Wallet</label>
                          <input
                            type="text"
                            placeholder="e.g. bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                            value={editCryptoWallet}
                            onChange={(e) => setEditCryptoWallet(e.target.value)}
                            className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-850 rounded-xl focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                      <button type="submit" className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold rounded-xl text-xs">
                        Save Identity Overrides
                      </button>
                      {editMsg && <p className="text-emerald-500 text-[10px] mt-1">{editMsg}</p>}
                    </form>

                    {/* Quick compliance switches */}
                    <div className="pt-6 border-t border-slate-100/10 space-y-4 text-left">
                      <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block">Status Actions</span>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={() => handleToggleSuspend(selectedUser)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            selectedUser.status === 'suspended' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'border-slate-100 dark:border-zinc-800 text-slate-500'
                          }`}
                        >
                          {selectedUser.status === 'suspended' ? 'Reactivate Profile' : 'Suspend Profile'}
                        </button>

                        <button
                          onClick={() => handleToggleFreeze(selectedUser)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            selectedUser.status === 'frozen' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'border-slate-100 dark:border-zinc-800 text-slate-500'
                          }`}
                        >
                          {selectedUser.status === 'frozen' ? 'Unfreeze Card/Access' : 'Freeze Card/Access'}
                        </button>

                        <button
                          onClick={() => handleToggleHold(selectedUser)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            selectedUser.status === 'hold' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 font-bold' : 'border-slate-100 dark:border-zinc-800 text-slate-500'
                          }`}
                        >
                          {selectedUser.status === 'hold' ? 'Remove Margin Hold' : 'Place Regulatory Hold'}
                        </button>

                        <button
                          onClick={() => handleToggleUpgraded(selectedUser)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1 ${
                            selectedUser.isUpgraded ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'border-slate-100 dark:border-zinc-800 text-slate-500'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          {selectedUser.isUpgraded ? 'Revoke Premium' : 'Upgrade Premium status'}
                        </button>

                        <button
                          onClick={() => handleToggleWithdrawalsLock(selectedUser)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            selectedUser.withdrawalsLocked ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 font-bold' : 'border-slate-100 dark:border-zinc-800 text-slate-500'
                          }`}
                        >
                          {selectedUser.withdrawalsLocked ? 'Unlock Outbound payouts' : 'Lock Outbound payouts'}
                        </button>
                      </div>
                    </div>

                    {/* PIN Security overrides */}
                    <div className="pt-6 border-t border-slate-100/10 space-y-4 text-left">
                      <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block">Payout Guard Overrides</span>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={() => handleTogglePinEnforce(selectedUser)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            selectedUser.withdrawalPinRequired ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'border-slate-100 dark:border-zinc-800 text-slate-500'
                          }`}
                        >
                          {selectedUser.withdrawalPinRequired ? 'Disable Security PIN Code' : 'Enforce Security PIN Code'}
                        </button>

                        <button onClick={() => handleGeneratePin(selectedUser)} className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          Regenerate Secure PIN
                        </button>

                        <button onClick={() => handleResetPin(selectedUser)} className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          Reset PIN (0000)
                        </button>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">
                        PIN ENFORCEMENT: {selectedUser.withdrawalPinRequired ? 'ACTIVE' : 'INACTIVE'} | ASSIGNED LEDGER PIN: <strong className="text-slate-700 dark:text-white">{selectedUser.withdrawalPin || 'NONE'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Ledger Balance Preview (5 columns) */}
                  <div className={`lg:col-span-5 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} flex flex-col justify-between`}>
                    <div>
                      <h4 className="font-display font-semibold text-sm">Portfolio Summary</h4>
                      <p className="text-[11px] text-slate-500">Live reserves audit records stored in database schemas.</p>
                    </div>

                    <div className="space-y-4 my-6 py-4 border-y border-slate-100/10">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Main/Checking Wallet:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-white">${getUserWallet(selectedUser.id)?.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Savings Account:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-white">${getUserWallet(selectedUser.id)?.savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Pending Ledger Assets:</span>
                        <span className="font-mono font-bold text-amber-500">${getUserWallet(selectedUser.id)?.pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-xs text-indigo-400">
                      <span className="font-mono font-bold uppercase text-[9px] block mb-1">compliance verification</span>
                      <p className="text-[11px] leading-normal">
                        To issue immediate compliance balance adjustments, proceed to the <strong>Wallet Management</strong> tab on the sidebar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* MEMBERS DIRECTORY */
              <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-display font-bold text-lg">Customer Ledger Directory</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Search active customer portfolios, override compliance parameters, and generate safety codes.</p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-xl font-sans text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((u) => {
                    const w = getUserWallet(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`p-5 rounded-2xl border cursor-pointer hover:border-indigo-500/30 transition-all flex justify-between items-start text-left ${
                          isDarkMode ? 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-950' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-200/50" />
                          <div>
                            <h4 className="text-xs font-bold font-display flex items-center gap-1.5 text-slate-800 dark:text-white">
                              {u.name}
                              {u.isUpgraded && <Award className="w-3.5 h-3.5 text-indigo-500" />}
                            </h4>
                            <span className="text-[10px] text-slate-400 block font-mono">{u.email}</span>
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {u.status}
                              </span>
                              {u.withdrawalsLocked && (
                                <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 text-amber-500 uppercase">
                                  Payout Lock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 block uppercase">aggregate balance</span>
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                              ${((w?.availableBalance || 0) + (w?.savingsBalance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                const amt = window.prompt(`Fund ${u.name}'s account (USD):`, '1000');
                                if (amt && !isNaN(Number(amt)) && Number(amt) > 0) {
                                  onAdjustWalletBalance(u.id, 'credit', Number(amt));
                                }
                              }}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm transition"
                            >
                              Fund Account
                            </button>
                            <button
                              onClick={() => {
                                const amt = window.prompt(`Deduct from ${u.name}'s account (USD):`, '1000');
                                if (amt && !isNaN(Number(amt)) && Number(amt) > 0) {
                                  onAdjustWalletBalance(u.id, 'debit', Number(amt));
                                }
                              }}
                              className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold shadow-sm transition"
                            >
                              Deduct Account
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-500 font-mono text-xs">
                      NO REGISTERED CUSTOMERS FOUND IN LEDGER ARCHIVE
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: LEDGER ADJUSTMENTS (WALLET MGMT) */}
        {activeSubTab === 'wallet_mgmt' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left`}
          >
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg">Central Ledger Adjustments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Directly inject, deduct, or adjust customer wallet available checking reserves.</p>
            </div>

            {selectedUser ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Form (7 columns) */}
                <form onSubmit={handleAdjustBalanceSubmit} className="md:col-span-7 space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850">
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{selectedUser.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {selectedUser.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Select Ledger Transaction Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {([
                        { id: 'credit', label: 'Credit Wallet' },
                        { id: 'debit', label: 'Debit Wallet' },
                        { id: 'bonus', label: 'Add Bonus' },
                        { id: 'adjust', label: 'Adjust Reserves' }
                      ] as const).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAdjustType(item.id)}
                          className={`py-2 px-1 text-center border rounded-xl text-[10px] font-semibold transition ${
                            adjustType === item.id ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600 font-bold' : 'border-slate-150 text-slate-500'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400">Adjustment Amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {adjustError && <p className="text-rose-500 text-[10px]">{adjustError}</p>}
                  {adjustSuccess && <p className="text-emerald-500 text-[10px] font-semibold">{adjustSuccess}</p>}

                  <div className="flex gap-3">
                    <button type="submit" className="px-5 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold rounded-xl text-xs uppercase">
                      Execute Overrides
                    </button>
                    <button type="button" onClick={() => onSelectUser(null)} className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs text-slate-500">
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Balances Display (5 columns) */}
                <div className="md:col-span-5 space-y-4">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Ledger Verification Balances</span>
                  <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-2xl text-xs font-mono space-y-3 text-slate-500">
                    <div className="flex justify-between">
                      <span>Checking:</span>
                      <span className="font-bold text-slate-800 dark:text-white">${getUserWallet(selectedUser.id)?.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Savings:</span>
                      <span className="font-bold text-slate-800 dark:text-white">${getUserWallet(selectedUser.id)?.savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold text-indigo-500">
                        ${(((getUserWallet(selectedUser.id)?.availableBalance || 0) + (getUserWallet(selectedUser.id)?.savingsBalance || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Please choose a customer from the roster list below to adjust ledger balances.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {usersList.filter(u => u.role !== 'admin').map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-4 rounded-2xl border cursor-pointer hover:border-indigo-500/30 transition-all flex items-center gap-3 ${
                        isDarkMode ? 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-950' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div className="text-left">
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[150px]">{u.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">Checking: ${getUserWallet(u.id)?.availableBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: DEPOSIT APPROVALS */}
        {activeSubTab === 'deposits' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left`}
          >
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                Deposit Settlement Queue
                {depositRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                    {depositRequests.length} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Audit and authorize inbound deposits requested by clients across institutional routes.</p>
            </div>

            <div className="space-y-3">
              {depositRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850 flex items-center justify-between text-xs font-sans">
                  <div className="space-y-1 text-left">
                    <span className="font-bold text-slate-800 dark:text-white">{req.userName}</span>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                      <span>Ref: {req.reference}</span>
                      <span>|</span>
                      <span className="capitalize">{req.method.replace('_', ' ')}</span>
                      <span>|</span>
                      <span>{req.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-emerald-600">+${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => onApproveDeposit(req.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:opacity-90 transition">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => onRejectDeposit(req.id)} className="p-1.5 bg-rose-500 text-white rounded-lg hover:opacity-90 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {depositRequests.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-mono text-xs border border-dashed border-slate-100 dark:border-zinc-850 rounded-2xl flex items-center justify-center">
                  NO PENDING DEPOSIT REQUISITIONS REPORTED
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: WITHDRAWALS APPROVALS */}
        {activeSubTab === 'withdrawals' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left`}
          >
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                Withdrawal Settlement Queue
                {withdrawalRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-rose-50 text-rose-600 font-bold border border-rose-100">
                    {withdrawalRequests.length} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Review compliance audit rules and authorize cash ledger discharges outbound.</p>
            </div>

            <div className="space-y-3">
              {withdrawalRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850 flex items-center justify-between text-xs font-sans">
                  <div className="space-y-1 text-left">
                    <span className="font-bold text-slate-800 dark:text-white">{req.userName}</span>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                      <span>Ref: {req.reference}</span>
                      <span>|</span>
                      <span className="capitalize">{req.method.replace('_', ' ')}</span>
                      <span>|</span>
                      <span>{req.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">-${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => onApproveWithdrawal(req.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:opacity-90 transition">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRejectWithdrawal(req.id)} className="p-1.5 bg-rose-500 text-white rounded-lg hover:opacity-90 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {onRequireDepositWithdrawal && (
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="number"
                          placeholder="$ Amount"
                          className="w-24 px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                          value={requireDepositValues[req.id] || ''}
                          onChange={(e) => setRequireDepositValues(prev => ({ ...prev, [req.id]: e.target.value }))}
                        />
                        <button 
                          onClick={() => {
                            const val = parseFloat(requireDepositValues[req.id]);
                            if (!isNaN(val) && val > 0) {
                              onRequireDepositWithdrawal(req.id, val);
                            }
                          }}
                          className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded hover:opacity-90 transition"
                        >
                          Require Deposit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {withdrawalRequests.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-mono text-xs border border-dashed border-slate-100 dark:border-zinc-850 rounded-2xl flex items-center justify-center">
                  NO PENDING OUTBOUND SETTLEMENT REQUISITIONS REPORTED
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 6: CENTRAL TRANSACTIONS HISTORY */}
        {activeSubTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left`}
          >
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg">Central System Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Global immutable stream of all completed micro-settlement records in this system.</p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[650px] flex flex-col gap-2 font-sans text-xs">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-3 px-3 font-mono text-[9px] uppercase text-slate-400 font-bold pb-1.5 border-b border-slate-150 dark:border-zinc-800">
                  <div className="col-span-2">Timestamp</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Ref ID</div>
                  <div className="col-span-2 text-right">Value</div>
                </div>

                {transactionLogs.map((t) => (
                  <div key={t.id} className="grid grid-cols-12 gap-3 px-3 py-3 border border-slate-100/10 rounded-xl hover:bg-slate-50/5 items-center text-left">
                    <div className="col-span-2 font-mono text-[10px] text-slate-400">{t.date}</div>
                    <div className="col-span-4 font-bold text-slate-800 dark:text-zinc-200 truncate">{t.description}</div>
                    <div className="col-span-2 capitalize">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-950 rounded-full font-mono text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                        {t.category}
                      </span>
                    </div>
                    <div className="col-span-2 font-mono text-[10px] text-slate-400">{t.reference}</div>
                    <div className="col-span-2 text-right">
                      <span className={`font-mono font-bold ${t.type === 'credit' ? 'text-emerald-500' : 'text-slate-500 dark:text-zinc-300'}`}>
                        {t.type === 'credit' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
                {transactionLogs.length === 0 && (
                  <div className="text-center py-12 text-slate-400 font-mono text-xs border border-dashed border-slate-100 dark:border-zinc-850 rounded-2xl flex items-center justify-center">
                    NO COMPLETED TRANSACTIONS REGISTERED IN THE CENTRAL DATABASE
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: SYSTEM AUDIT LOGS */}
        {activeSubTab === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left`}
          >
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Compliance Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Immutable audit logs of all administrative actions, compliance overrides, and parameter updates.</p>
            </div>

            <div className="overflow-y-auto max-h-[500px] pr-1 flex flex-col gap-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-150 dark:border-zinc-850 text-xs text-left text-slate-600 dark:text-zinc-300 font-sans space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-indigo-500 font-mono uppercase text-[9px] tracking-wider">
                      ● ACTION: {log.action}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-white leading-relaxed">{log.details}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-slate-200/10 text-[9px] text-slate-400 font-mono">
                    <span>OPERATOR: {log.actorName}</span>
                    <span>TARGET: {log.targetUserName} (ID: {log.targetUserId})</span>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-mono text-xs border border-dashed border-slate-100 dark:border-zinc-850 rounded-2xl flex items-center justify-center">
                  NO AUDIT LOGS REPORTED IN THE CURRENT SESSION
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 8: PERFORMANCE REPORTS */}
        {activeSubTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Regulatory Reports & Analytics</h2>
              <p className="text-xs text-slate-500 mt-1">Audit liabilities composition, settlement indices, and transaction flows summaries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resouces liability card */}
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm'} space-y-4`}>
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Liquidity Assets Distribution</h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/10">
                    <span className="text-slate-400">Total Reserves (USD):</span>
                    <span className="font-bold text-slate-800 dark:text-white">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/10">
                    <span className="text-slate-400">Aggregate Checking (Checking):</span>
                    <span className="font-bold text-indigo-500">${totalChecking.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/10">
                    <span className="text-slate-400">Aggregate Savings Vault:</span>
                    <span className="font-bold text-emerald-500">${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Liabilities Coverage ratio:</span>
                    <span className="font-bold text-emerald-500">100.00% Fully Backed</span>
                  </div>
                </div>
              </div>

              {/* Inbound/Outbound velocities */}
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm'} space-y-4`}>
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Settlement velocity reports</h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/10">
                    <span className="text-slate-400">Pending Inbounds (Deposits):</span>
                    <span className="font-bold text-emerald-500">+${totalDepositedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/10">
                    <span className="text-slate-400">Pending Outbounds (Withdrawals):</span>
                    <span className="font-bold text-rose-500">-${totalWithdrawnAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/10">
                    <span className="text-slate-400">Net Pending Settlement Velocity:</span>
                    <span className={`font-bold ${(totalDepositedAmount - totalWithdrawnAmount) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ${(totalDepositedAmount - totalWithdrawnAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Database Ledger Integrity:</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1">● VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 9: BROADCAST NOTIFICATIONS */}
        {activeSubTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left`}
          >
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" /> Admin Broadcast Terminal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Dispatch custom alerts, reminders, or general compliance updates into specified user notification boards.</p>
            </div>

            <form onSubmit={handleBroadcastNotification} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Alert Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Identity Verification Upgrade Approved"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Target Portfolio/User</label>
                  <select
                    value={notifTargetUserId}
                    onChange={(e) => setNotifTargetUserId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs focus:outline-none font-sans"
                  >
                    <option value="all">📢 GLOBAL BROADCAST (All Customers)</option>
                    {usersList.filter(u => u.role !== 'admin').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Notice Context Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Your verification has been successfully validated. Transaction thresholds have been adjusted to $100,000."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {notifSuccess && <p className="text-emerald-500 font-sans text-xs font-semibold">{notifSuccess}</p>}

              <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs uppercase flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Dispatch Notice
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 10: ADMINISTRATIVE SETTINGS */}
        {activeSubTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} text-left`}
          >
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" /> Regulatory Controls
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Toggle global withdrawal lock thresholds, enforce verification layers, and configure ledger parameters.</p>
            </div>

            <form onSubmit={handleSaveSystemSettings} className="space-y-6">
              <div className="space-y-4">
                {/* Global payout lock */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100/10">
                  <div>
                    <span className="text-xs font-semibold block">Global Settlement Freeze</span>
                    <p className="text-[10px] text-slate-400 max-w-sm">When enabled, completely freezes all customer outbound payouts regardless of profile specific configurations.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGlobalLock(!globalLock)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      globalLock ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 font-bold' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    {globalLock ? 'Active (All payouts frozen)' : 'Disabled (Allow standard compliance)'}
                  </button>
                </div>

                {/* Maximum transfer caps */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/10">
                  <div>
                    <span className="text-xs font-semibold block">Max Single Transaction Cap (USD)</span>
                    <p className="text-[10px] text-slate-400 max-w-sm">Define maximum amount allowed for individual inbound or outbound ledger movements.</p>
                  </div>
                  <input
                    type="number"
                    value={maxTransferLimit}
                    onChange={(e) => setMaxTransferLimit(e.target.value)}
                    className="w-full sm:w-44 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-xl text-xs font-semibold text-right focus:outline-none"
                  />
                </div>

                {/* Compliance verification tiering */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                  <div>
                    <span className="text-xs font-semibold block">Regulatory Compliance Enforcement Mode</span>
                    <p className="text-[10px] text-slate-400 max-w-sm">Set required security layers: standard verification or strict multi-party authentication.</p>
                  </div>
                  <select
                    value={complianceLevel}
                    onChange={(e) => setComplianceLevel(e.target.value)}
                    className="w-full sm:w-44 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-xl text-xs font-semibold"
                  >
                    <option value="standard">Standard Autopay</option>
                    <option value="double">Double Handshake</option>
                    <option value="strict">Strict KYC Required</option>
                  </select>
                </div>
              </div>

              {settingsSuccess && <p className="text-emerald-500 font-sans text-xs font-semibold">{settingsSuccess}</p>}

              <button type="submit" className="px-5 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold rounded-xl text-xs uppercase">
                Save System Parameters
              </button>
            </form>
          </motion.div>
        )}

        {/* DETAIL COMPLIANCE AUDIT MODAL */}
        {selectedRequest && (
          <motion.div
            key="compliance-audit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className={`w-full max-w-2xl rounded-3xl border p-6 md:p-8 space-y-6 text-left relative overflow-y-auto max-h-[90vh] ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-250 text-slate-900 shadow-2xl'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="border-b border-slate-100/10 pb-4 pr-10">
                <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest block mb-1">
                  Compliance Audit & Clearance
                </span>
                <h3 className="font-display font-black text-xl">
                  {selectedRequest.type === 'Sovereign KYC ID Verification' ? 'Audit Sovereign KYC Profile' : 'Audit Tax Filing & Asset Limit'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Carefully review the cryptographic documents and ledger parameters below before granting institutional clearance.
                </p>
              </div>

              {/* User Overview */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100/10 rounded-2xl">
                <img
                  src={selectedRequest.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedRequest.user.name}`}
                  alt={selectedRequest.user.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full border border-slate-200/50 object-cover shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100">{selectedRequest.user.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedRequest.user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[9px] font-bold uppercase">
                    Level 2 Audit Pending
                  </span>
                </div>
              </div>

              {/* Specific Details */}
              {selectedRequest.type === 'Sovereign KYC ID Verification' ? (
                // KYC DETAILS
                <div className="space-y-6">
                  {(() => {
                    let kycDetails: any = {};
                    try {
                      if (selectedRequest.user.uploadedIdUrl) {
                        kycDetails = JSON.parse(selectedRequest.user.uploadedIdUrl);
                      }
                    } catch(e) {}

                    const legalName = kycDetails.fullName || selectedRequest.user.name || 'Not Provided';
                    const dobVal = kycDetails.dob || selectedRequest.user.dateOfBirth || 'Not Provided';
                    const addrVal = kycDetails.address || selectedRequest.user.residentialAddress || 'Not Provided';
                    const idTypeVal = kycDetails.idType || selectedRequest.user.govIdType || 'SSN';
                    const taxIdVal = kycDetails.taxId || selectedRequest.user.govIdNumber || 'Not Provided';

                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Full Legal Name</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 block">{legalName}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                            <span className="font-bold text-slate-850 dark:text-zinc-200 block font-mono">{dobVal}</span>
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Residential Address</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">{addrVal}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Identifier Class</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 block">{idTypeVal}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Tax ID / SSN</span>
                            <span className="font-mono font-bold text-indigo-500 block">{taxIdVal}</span>
                          </div>
                        </div>

                        {/* Sovereign ID Front & Back side-by-side scans */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            Cryptographically Signed Identification Scans
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Front Scan Card */}
                            <div className="group relative border border-slate-100/10 rounded-2xl overflow-hidden bg-zinc-950 aspect-[1.58/1] flex items-center justify-center">
                              <img
                                src={kycDetails.frontIdUrl || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600"}
                                alt="ID FRONT"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-350"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-250 p-3 flex items-end">
                                <span className="font-mono text-[9px] font-bold text-white tracking-widest uppercase">
                                  ID DOCUMENT FRONT
                                </span>
                              </div>
                            </div>

                            {/* Back Scan Card */}
                            <div className="group relative border border-slate-100/10 rounded-2xl overflow-hidden bg-zinc-950 aspect-[1.58/1] flex items-center justify-center">
                              <img
                                src={kycDetails.backIdUrl || "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600"}
                                alt="ID BACK"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-350"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-250 p-3 flex items-end">
                                <span className="font-mono text-[9px] font-bold text-white tracking-widest uppercase">
                                  ID DOCUMENT BACK
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                // TAX FILING DETAILS
                <div className="space-y-6">
                  {(() => {
                    let taxDetails: any = {};
                    try {
                      if (selectedRequest.user.sourceFunds) {
                        taxDetails = JSON.parse(selectedRequest.user.sourceFunds);
                      }
                    } catch(e) {}

                    const filingStatus = taxDetails.filingStatus || 'Not Specified';
                    const w2Wages = Number(taxDetails.w2Wages || 0);
                    const interestIncome = Number(taxDetails.interestIncome || 0);
                    const capitalGains = Number(taxDetails.capitalGains || 0);
                    const choiceDeduction = taxDetails.deductionChoice || 'standard';
                    const deductionAmt = choiceDeduction === 'standard' ? 14600 : Number(taxDetails.itemizedAmount || 14600);

                    const gross = w2Wages + interestIncome + capitalGains;
                    const taxable = Math.max(0, gross - deductionAmt);

                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100/10">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Filing Status</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 block capitalize">{filingStatus}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Gross Income (Sum)</span>
                            <span className="font-bold font-mono text-slate-800 dark:text-zinc-200 block">${gross.toLocaleString()}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Deduction applied</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300 block capitalize">{choiceDeduction} (${deductionAmt.toLocaleString()})</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Taxable Income basis</span>
                            <span className="font-mono font-bold text-emerald-500 block">${taxable.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-2 text-xs">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Income Breakdown Ledger</span>
                          <div className="space-y-2">
                            <div className="flex justify-between py-1.5 border-b border-slate-100/10">
                              <span className="text-slate-400">W-2 Wages:</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-zinc-200">${w2Wages.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100/10">
                              <span className="text-slate-400">1099-INT Tax-exempt Interest:</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-zinc-200">${interestIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100/10">
                              <span className="text-slate-400">1099-B Crypto/Stock Capital Gains:</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-zinc-200">${capitalGains.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100/10">
                <button
                  type="button"
                  onClick={async () => {
                    if (selectedRequest.type === 'Sovereign KYC ID Verification') {
                      onUpdateUserDetails(selectedRequest.userId, { verificationStatus: 'verified' });
                    } else {
                      try {
                        const taxObj = JSON.parse(selectedRequest.user.sourceFunds);
                        taxObj.taxFilingStatus = 'approved';
                        onUpdateUserDetails(selectedRequest.userId, { sourceFunds: JSON.stringify(taxObj) });
                      } catch(e) {}
                    }
                    setSelectedRequest(null);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition hover:scale-101 active:scale-99"
                >
                  Approve Compliance
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (selectedRequest.type === 'Sovereign KYC ID Verification') {
                      onUpdateUserDetails(selectedRequest.userId, { verificationStatus: 'unverified' });
                    } else {
                      try {
                        const taxObj = JSON.parse(selectedRequest.user.sourceFunds);
                        taxObj.taxFilingStatus = 'rejected';
                        onUpdateUserDetails(selectedRequest.userId, { sourceFunds: JSON.stringify(taxObj) });
                      } catch(e) {}
                    }
                    setSelectedRequest(null);
                  }}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition hover:scale-101 active:scale-99"
                >
                  Deny Compliance
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
