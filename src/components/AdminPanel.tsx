import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, Shield, ClipboardList, Sparkles, Check, X, AlertTriangle, ArrowUpRight, ArrowDownRight, Edit3, DollarSign, Search, Gift, Eye, Lock, Unlock, Award, RefreshCw, Layers 
} from 'lucide-react';
import { UserProfile, Wallet, DepositRequest, WithdrawalRequest, AuditLog, BankTransaction } from '../types';

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
  onUpdateUserDetails: (userId: string, updates: Partial<UserProfile>) => void;
  onAdjustWalletBalance: (userId: string, actionType: 'credit' | 'debit' | 'bonus' | 'adjust', amount: number) => void;
  isDarkMode: boolean;
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
  onUpdateUserDetails,
  onAdjustWalletBalance,
  isDarkMode
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'requests' | 'audit' | 'ledger_logs'>('users');
  
  // User Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Balance Adjust States
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit' | 'bonus' | 'adjust'>('credit');
  const [adjustSuccess, setAdjustSuccess] = useState('');
  const [adjustError, setAdjustError] = useState('');

  // Profile Edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMsg, setEditMsg] = useState('');

  // Filter users list (excluding other admins to avoid circular edits)
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && u.role !== 'admin';
  });

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
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
      phone: editPhone
    });
    setEditMsg('User basic details updated successfully.');
    setTimeout(() => setEditMsg(''), 3000);
  };

  // Status adjustments toggles
  const handleToggleSuspend = (user: UserProfile) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    onUpdateUserDetails(user.id, { status: nextStatus });
    setSelectedUser({ ...selectedUser!, status: nextStatus });
  };

  const handleToggleFreeze = (user: UserProfile) => {
    const nextStatus = user.status === 'frozen' ? 'active' : 'frozen';
    onUpdateUserDetails(user.id, { status: nextStatus });
    setSelectedUser({ ...selectedUser!, status: nextStatus });
  };

  const handleToggleHold = (user: UserProfile) => {
    const nextStatus = user.status === 'hold' ? 'active' : 'hold';
    onUpdateUserDetails(user.id, { status: nextStatus });
    setSelectedUser({ ...selectedUser!, status: nextStatus });
  };

  const handleToggleUpgraded = (user: UserProfile) => {
    const nextVal = !user.isUpgraded;
    onUpdateUserDetails(user.id, { isUpgraded: nextVal });
    setSelectedUser({ ...selectedUser!, isUpgraded: nextVal });
  };

  const handleToggleWithdrawalsLock = (user: UserProfile) => {
    const nextVal = !user.withdrawalsLocked;
    onUpdateUserDetails(user.id, { withdrawalsLocked: nextVal });
    setSelectedUser({ ...selectedUser!, withdrawalsLocked: nextVal });
  };

  const handleTogglePinEnforce = (user: UserProfile) => {
    const nextVal = !user.withdrawalPinRequired;
    onUpdateUserDetails(user.id, { withdrawalPinRequired: nextVal });
    setSelectedUser({ ...selectedUser!, withdrawalPinRequired: nextVal });
  };

  const handleGeneratePin = (user: UserProfile) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    onUpdateUserDetails(user.id, { withdrawalPin: newPin });
    setSelectedUser({ ...selectedUser!, withdrawalPin: newPin });
    alert(`[ADMIN HANDSHAKE] Generated secure withdrawal PIN for ${user.name}: ${newPin}`);
  };

  const handleResetPin = (user: UserProfile) => {
    onUpdateUserDetails(user.id, { withdrawalPin: '0000' });
    setSelectedUser({ ...selectedUser!, withdrawalPin: '0000' });
    alert(`[ADMIN ACTION] Reset withdrawal PIN for ${user.name} to fallback: 0000`);
  };

  // Adjust Wallet Balance submit
  const handleAdjustBalanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAdjustSuccess('');
    setAdjustError('');
    if (!selectedUser) return;

    const parsed = parseFloat(adjustAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setAdjustError('Enter a valid positive number for ledger adjustment.');
      return;
    }

    onAdjustWalletBalance(selectedUser.id, adjustType, parsed);
    setAdjustSuccess(`Ledger balance adjusted! Executed ${adjustType.toUpperCase()} of $${parsed.toFixed(2)}.`);
    setAdjustAmount('');
  };

  // Helper to fetch wallet of selected user
  const getUserWallet = (userId: string) => {
    return walletsList.find((w) => w.userId === userId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left w-full items-start font-sans">
      
      {/* Sidebar navigation tabs (3 columns) */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h3 className="font-display font-bold text-sm">Regulatory Control</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-5 leading-normal">
            Authoritative sandbox override interface. All changes enforce administrative ledger logs in audit trails.
          </p>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                setActiveSubTab('users');
                setSelectedUser(null);
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeSubTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50/5'
              }`}
            >
              <Users className="w-4 h-4" /> User Management
            </button>
            <button
              onClick={() => {
                setActiveSubTab('requests');
                setSelectedUser(null);
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition ${
                activeSubTab === 'requests' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50/5'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" /> Settlement Queues
              </span>
              {(depositRequests.length + withdrawalRequests.length) > 0 && (
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-rose-500 text-white rounded-full">
                  {depositRequests.length + withdrawalRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveSubTab('audit');
                setSelectedUser(null);
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeSubTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50/5'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Compliance Audit Trail
            </button>
            <button
              onClick={() => {
                setActiveSubTab('ledger_logs');
                setSelectedUser(null);
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeSubTab === 'ledger_logs' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50/5'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Live Transaction Ledger
            </button>
          </div>
        </div>

        {/* Admin operator signature card */}
        <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-900 text-white'}`}>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Authenticated Officer</span>
          <h4 className="text-xs font-bold font-display">{adminUser.name}</h4>
          <p className="text-[10px] text-emerald-400 mt-0.5">Role: Nexa General Counsel</p>
        </div>
      </div>

      {/* Main Content Pane (9 columns) */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* SUBTAB 1: USER MANAGEMENT */}
        {activeSubTab === 'users' && !selectedUser && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg">Member Custody Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">Search users, audit portfolios, and adjust direct compliance status.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>
            </div>

            {/* Users grid list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredUsers.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-400 font-mono text-xs">
                  NO USERS REGISTERED IN SANDBOX COMPLIANCE
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const w = getUserWallet(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-5 rounded-2xl border transition hover:border-indigo-500/40 cursor-pointer text-left flex justify-between items-start ${
                        isDarkMode ? 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-950' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                      }`}
                      id={`admin-user-item-${u.id}`}
                    >
                      <div className="flex gap-3">
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-200/50" />
                        <div>
                          <h4 className="text-xs font-bold font-display flex items-center gap-1">
                            {u.name}
                            {u.isUpgraded && <Award className="w-3.5 h-3.5 text-indigo-500" />}
                          </h4>
                          <span className="text-[10px] text-slate-500 block font-mono">{u.email}</span>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                              u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {u.status}
                            </span>
                            {u.withdrawalsLocked && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 text-amber-500 uppercase">
                                Outbound Lock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">COMBINED LEDGER</span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                          ${((w?.mainBalance || 0) + (w?.savingsBalance || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* USER DETAILED OPERATOR CONSOLE */}
        {activeSubTab === 'users' && selectedUser && (
          <div className="flex flex-col gap-6">
            
            {/* Back header button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="px-3.5 py-1.5 self-start bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 rounded-xl text-xs font-sans font-semibold border border-slate-200/50 dark:border-zinc-800 hover:scale-105 transition"
            >
              ← Back to Users
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Profile details & Quick Toggles (7 columns) */}
              <div className={`md:col-span-7 p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} space-y-6`}>
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100/10">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="font-display font-bold text-base flex items-center gap-1.5">
                      {selectedUser.name}
                      {selectedUser.isUpgraded && <Award className="w-4 h-4 text-indigo-500" />}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">ID: {selectedUser.id} | Email: {selectedUser.email}</p>
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSaveProfileEdit} className="space-y-4 text-xs">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                    Basic Profile Override
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-slate-500">Legal Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-slate-500">Registered Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-sans font-semibold rounded-lg text-xs"
                  >
                    Save Changes
                  </button>
                  {editMsg && <p className="text-emerald-500 font-sans text-[11px] mt-1">{editMsg}</p>}
                </form>

                {/* Compliance override actions */}
                <div className="pt-4 border-t border-slate-100/10 space-y-4">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                    Administrative Compliance Controls
                  </span>

                  <div className="flex flex-wrap gap-2.5">
                    {/* Suspend Toggle */}
                    <button
                      onClick={() => handleToggleSuspend(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl border font-sans font-medium text-xs transition ${
                        selectedUser.status === 'suspended'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                      id="btn-admin-suspend"
                    >
                      {selectedUser.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                    </button>

                    {/* Freeze Toggle */}
                    <button
                      onClick={() => handleToggleFreeze(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl border font-sans font-medium text-xs transition ${
                        selectedUser.status === 'frozen'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                      id="btn-admin-freeze"
                    >
                      {selectedUser.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account'}
                    </button>

                    {/* Hold Toggle */}
                    <button
                      onClick={() => handleToggleHold(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl border font-sans font-medium text-xs transition ${
                        selectedUser.status === 'hold'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                      id="btn-admin-hold"
                    >
                      {selectedUser.status === 'hold' ? 'Remove Hold' : 'Place Account on Hold'}
                    </button>

                    {/* Upgrade Premium */}
                    <button
                      onClick={() => handleToggleUpgraded(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl border font-sans font-medium text-xs transition flex items-center gap-1 ${
                        selectedUser.isUpgraded
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                      id="btn-admin-upgrade"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {selectedUser.isUpgraded ? 'Remove Premium Status' : 'Mark Account as Upgraded'}
                    </button>

                    {/* Payout Lock */}
                    <button
                      onClick={() => handleToggleWithdrawalsLock(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl border font-sans font-medium text-xs transition ${
                        selectedUser.withdrawalsLocked
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                      id="btn-admin-lock-withdrawals"
                    >
                      {selectedUser.withdrawalsLocked ? 'Enable Withdrawals' : 'Lock Withdrawals'}
                    </button>
                  </div>
                </div>

                {/* PIN Specific Actions */}
                <div className="pt-4 border-t border-slate-100/10 space-y-3">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                    Security PIN Security Controls
                  </span>
                  
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleTogglePinEnforce(selectedUser)}
                      className={`px-3 py-1.5 rounded-xl border font-sans font-medium text-xs transition ${
                        selectedUser.withdrawalPinRequired
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                      id="btn-admin-toggle-pin-policy"
                    >
                      {selectedUser.withdrawalPinRequired ? 'Disable Withdrawal PIN' : 'Require Withdrawal PIN'}
                    </button>
                    
                    <button
                      onClick={() => handleGeneratePin(selectedUser)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-sans font-medium border border-slate-250"
                      id="btn-admin-generate-pin"
                    >
                      Generate Payout PIN
                    </button>
                    
                    <button
                      onClick={() => handleResetPin(selectedUser)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-sans font-medium border border-slate-250"
                      id="btn-admin-reset-pin"
                    >
                      Reset PIN Code
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono block">
                    CURRENT POLICY SETTINGS: {selectedUser.withdrawalPinRequired ? 'ENFORCED' : 'OFF'} | ACTIVE PIN: **{selectedUser.withdrawalPin || 'NONE'}**
                  </p>
                </div>

              </div>

              {/* Adjust balances console (5 columns) */}
              <div className={`md:col-span-5 p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'} flex flex-col justify-between`}>
                <div>
                  <h4 className="font-display font-semibold text-sm mb-1">Ledger Adjustments</h4>
                  <p className="text-[11px] text-slate-500">Inject or adjust direct cash ledger balances.</p>
                </div>

                <form onSubmit={handleAdjustBalanceSubmit} className="my-6 space-y-4">
                  {/* Select adjustment type */}
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'credit', label: 'Credit Wallet' },
                      { id: 'debit', label: 'Debit Wallet' },
                      { id: 'bonus', label: 'Add Bonus' },
                      { id: 'adjust', label: 'Adjust Balance' }
                    ] as const).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAdjustType(item.id)}
                        className={`py-2 px-1 text-center border rounded-xl text-[10px] font-sans font-semibold transition ${
                          adjustType === item.id
                            ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] uppercase font-mono text-slate-500">Adjustment Value ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                      <input
                        type="number"
                        placeholder="100.00"
                        value={adjustAmount}
                        onChange={(e) => {
                          setAdjustAmount(e.target.value);
                          setAdjustSuccess('');
                          setAdjustError('');
                        }}
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 rounded-xl"
                      />
                    </div>
                  </div>

                  {adjustError && <p className="text-[10px] text-rose-500 font-sans">{adjustError}</p>}
                  {adjustSuccess && <p className="text-[10px] text-emerald-500 font-sans">{adjustSuccess}</p>}

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-xl text-xs font-semibold font-sans uppercase"
                  >
                    Post Handshake Adjustment
                  </button>
                </form>

                {/* Display active User Portfolio balances for sanity check */}
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl text-xs text-slate-500 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Checking Wallet:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-300">
                      ${getUserWallet(selectedUser.id)?.availableBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Wallet:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-300">
                      ${getUserWallet(selectedUser.id)?.pendingBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Savings Vault:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-300">
                      ${getUserWallet(selectedUser.id)?.savingsBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 2: SETTLEMENT QUEUES (APPROVE DEPOSITS / WITHDRAWALS) */}
        {activeSubTab === 'requests' && (
          <div className="flex flex-col gap-6 text-left">
            
            {/* Deposits Approval Queue */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
              <div className="mb-4">
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  Deposit Ledger Settlement Queue
                  {depositRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                      {depositRequests.length} Pending
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">Review, audit and settle inbound funding requests into customer available wallets.</p>
              </div>

              {depositRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs border-2 border-dashed border-slate-100 dark:border-zinc-850 rounded-2xl flex items-center justify-center">
                  NO PENDING DEPOSIT HANDSHAKES REPORTED
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {depositRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850 flex items-center justify-between text-xs font-sans">
                      <div className="space-y-1">
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
                        <span className="font-mono font-bold text-emerald-600">+${req.amount.toLocaleString()}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onApproveDeposit(req.id)}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:opacity-90 transition"
                            title="Approve & Settlement"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectDeposit(req.id)}
                            className="p-1.5 bg-rose-500 text-white rounded-lg hover:opacity-90 transition"
                            title="Reject Request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Withdrawals Approval Queue */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
              <div className="mb-4">
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  Withdrawal Ledger Discharge Queue
                  {withdrawalRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-rose-50 text-rose-600 font-bold border border-rose-100">
                      {withdrawalRequests.length} Pending
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">Authorize compliance audit reviews and dispatch outbound transactions.</p>
              </div>

              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs border-2 border-dashed border-slate-100 dark:border-zinc-850 rounded-2xl flex items-center justify-center">
                  NO PENDING OUTBOUND CUSTODY SETTLEMENTS
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {withdrawalRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-850 flex items-center justify-between text-xs font-sans">
                      <div className="space-y-1">
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
                        <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">-${req.amount.toLocaleString()}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onApproveWithdrawal(req.id)}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:opacity-90 transition"
                            title="Approve Settlement"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectWithdrawal(req.id)}
                            className="p-1.5 bg-rose-500 text-white rounded-lg hover:opacity-90 transition"
                            title="Reject Settlement"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 3: COMPLIANCE AUDIT TRAILS */}
        {activeSubTab === 'audit' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Audit Trail Log System
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Immutable record of all regulatory and administrative overrides executed in this session.</p>
            </div>

            <div className="overflow-y-auto max-h-[450px] pr-1 flex flex-col gap-3">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">
                  NO OVERRIDE LOGS COMPILED
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-150 dark:border-zinc-850 text-xs text-left text-slate-600 dark:text-zinc-300 font-sans space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-indigo-500 font-mono uppercase text-[10px] tracking-wider">
                        ● ACTION: {log.action}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">{log.timestamp}</span>
                    </div>
                    
                    <p className="font-medium text-slate-800 dark:text-white leading-relaxed">{log.details}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-200/20 text-[10px] text-slate-400 font-mono">
                      <span>OPERATOR: {log.actorName}</span>
                      <span>TARGET: {log.targetUserName} (ID: {log.targetUserId})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 4: LEDGER TRANSACTION STREAM */}
        {activeSubTab === 'ledger_logs' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg">Central Ledger Stream</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time stream of all settled and pending customer ledger transactions.</p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[650px] flex flex-col gap-2.5 text-xs">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-3 px-3 font-mono text-[9px] uppercase text-slate-400 font-bold pb-1.5 border-b border-slate-100/5">
                  <div className="col-span-2">Date/Time</div>
                  <div className="col-span-4">Transaction Description</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Reference</div>
                  <div className="col-span-2 text-right">Settled Balance</div>
                </div>

                {transactionLogs.map((t) => (
                  <div key={t.id} className="grid grid-cols-12 gap-3 px-3 py-3 border border-slate-100/10 rounded-xl hover:bg-slate-50/5 items-center">
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
                        {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
