import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Sparkles, LogOut, Bell, Clock, Compass, HelpCircle, ChevronRight, 
  RefreshCw, BarChart3, TrendingUp, Settings, History, Send, ArrowUpRight, 
  ArrowDownRight, Wallet, User, Menu, X, Award, Eye, Key, AlertTriangle 
} from 'lucide-react';

import { 
  UserProfile, Wallet as BankWallet, BankTransaction, DepositRequest, 
  WithdrawalRequest, AuditLog, BankNotification 
} from './types';

import { 
  initializeBankDatabase, SEED_USERS, SEED_WALLETS, SEED_TRANSACTIONS, 
  SEED_DEPOSITS, SEED_WITHDRAWALS, SEED_AUDIT_LOGS, SEED_NOTIFICATIONS 
} from './utils/demoData';

// Reusable components
import AuthScreens from './components/AuthScreens';
import DashboardOverview from './components/DashboardOverview';
import DepositWithdraw from './components/DepositWithdraw';
import TransferFunds from './components/TransferFunds';
import TransactionsHistory from './components/TransactionsHistory';
import SettingsPanel from './components/SettingsPanel';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Session authentication states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Primary database states mapped to local storage
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [wallets, setWallets] = useState<BankWallet[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<BankNotification[]>([]);

  // UI state overlays
  const [showNotificationsInbox, setShowNotificationsInbox] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and load database on startup
  useEffect(() => {
    initializeBankDatabase();

    const loadData = () => {
      const storedUsers = localStorage.getItem('nexabank_users');
      const storedWallets = localStorage.getItem('nexabank_wallets');
      const storedTxs = localStorage.getItem('nexabank_transactions');
      const storedDeposits = localStorage.getItem('nexabank_deposits');
      const storedWithdrawals = localStorage.getItem('nexabank_withdrawals');
      const storedAudit = localStorage.getItem('nexabank_audit');
      const storedNotifs = localStorage.getItem('nexabank_notifications');

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedWallets) setWallets(JSON.parse(storedWallets));
      if (storedTxs) setTransactions(JSON.parse(storedTxs));
      if (storedDeposits) setDeposits(JSON.parse(storedDeposits));
      if (storedWithdrawals) setWithdrawals(JSON.parse(storedWithdrawals));
      if (storedAudit) setAuditLogs(JSON.parse(storedAudit));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    };

    loadData();
  }, []);

  // Update UTC clock ticker
  useEffect(() => {
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

  // Synchronizer wrapper to write states to localStorage instantly
  const syncDatabase = (
    nextUsers: UserProfile[],
    nextWallets: BankWallet[],
    nextTxs: BankTransaction[],
    nextDeposits: DepositRequest[],
    nextWithdrawals: WithdrawalRequest[],
    nextAudit: AuditLog[],
    nextNotifs: BankNotification[]
  ) => {
    setUsers(nextUsers);
    setWallets(nextWallets);
    setTransactions(nextTxs);
    setDeposits(nextDeposits);
    setWithdrawals(nextWithdrawals);
    setAuditLogs(nextAudit);
    setNotifications(nextNotifs);

    localStorage.setItem('nexabank_users', JSON.stringify(nextUsers));
    localStorage.setItem('nexabank_wallets', JSON.stringify(nextWallets));
    localStorage.setItem('nexabank_transactions', JSON.stringify(nextTxs));
    localStorage.setItem('nexabank_deposits', JSON.stringify(nextDeposits));
    localStorage.setItem('nexabank_withdrawals', JSON.stringify(nextWithdrawals));
    localStorage.setItem('nexabank_audit', JSON.stringify(nextAudit));
    localStorage.setItem('nexabank_notifications', JSON.stringify(nextNotifs));

    // Also update current active session user details for reactive changes
    if (currentUser) {
      const refreshedUser = nextUsers.find((u) => u.id === currentUser.id);
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
      }
    }
  };

  // Helper helper to generate timestamps
  const getFormattedDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // LOG IN action
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // LAND directly in appropriate dashboard depending on role
    if (user.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
    triggerToast(`Welcome back, ${user.name}! Authorized.`);
  };

  // LOG OUT action
  const handleLogOut = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
    triggerToast('Securely disconnected from NexaBank ledgers.');
  };

  // REGISTER action
  const handleRegisterUser = (name: string, email: string) => {
    const nextId = `u-${Date.now()}`;
    const newUser: UserProfile = {
      id: nextId,
      name,
      email,
      role: 'user',
      status: 'active',
      withdrawalPinRequired: true,
      withdrawalPin: String(Math.floor(1000 + Math.random() * 9000)),
      isUpgraded: false,
      phone: '+1 (555) 019-2831',
      mfaEnabled: false,
      verificationStatus: 'unverified',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const newWallet: BankWallet = {
      userId: nextId,
      mainBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      savingsBalance: 0
    };

    const updatedUsers = [...users, newUser];
    const updatedWallets = [...wallets, newWallet];

    syncDatabase(
      updatedUsers,
      updatedWallets,
      transactions,
      deposits,
      withdrawals,
      auditLogs,
      notifications
    );
  };

  // ADD DIRECT AUDIT LOG ACTION
  const handleAddAuditLog = (action: string, details: string, targetUser?: UserProfile) => {
    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser?.id || 'system',
      actorName: currentUser?.name || 'Automated Ledger Sentry',
      action,
      targetUserId: targetUser?.id || currentUser?.id || 'none',
      targetUserName: targetUser?.name || currentUser?.name || 'none',
      details,
      timestamp: getFormattedDate()
    };
    const updatedAudit = [newLog, ...auditLogs];
    syncDatabase(users, wallets, transactions, deposits, withdrawals, updatedAudit, notifications);
  };

  // CREATE NOTIFICATION FOR DESIGNATED USER
  const handleAddNotification = (userId: string, title: string, message: string) => {
    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId,
      title,
      message,
      read: false,
      timestamp: getFormattedDate()
    };
    const updatedNotifs = [newNotif, ...notifications];
    syncDatabase(users, wallets, transactions, deposits, withdrawals, auditLogs, updatedNotifs);
  };

  // 1. EXECUTE DEPOSIT REQUEST (User-triggered)
  const handleAddDeposit = (amount: number, method: 'bank_wire' | 'crypto_usdt' | 'credit_card') => {
    if (!currentUser) return;

    // Create a pending DepositRequest
    const depId = `dep-${Date.now()}`;
    const newRequest: DepositRequest = {
      id: depId,
      userId: currentUser.id,
      userName: currentUser.name,
      amount,
      method,
      status: 'pending',
      date: getFormattedDate(),
      reference: `DEP-${method.toUpperCase().slice(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`
    };

    // Place the amount in user's pending balance
    const updatedWallets = wallets.map((w) => {
      if (w.userId === currentUser.id) {
        return {
          ...w,
          pendingBalance: w.pendingBalance + amount
        };
      }
      return w;
    });

    const updatedDeposits = [newRequest, ...deposits];

    // Trigger Notification & Logs
    const notificationMessage = `Your deposit of $${amount.toLocaleString()} via ${method.replace('_', ' ')} is submitted and pending clearance audit.`;
    const auditMessage = `User requested account credit of $${amount.toLocaleString()} via ${method.toUpperCase()}.`;

    // Perform atomic sync
    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId: currentUser.id,
      title: 'Pending Deposit Logged',
      message: notificationMessage,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'Request Deposit',
      targetUserId: currentUser.id,
      targetUserName: currentUser.name,
      details: auditMessage,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      transactions,
      updatedDeposits,
      withdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast('Deposit request generated and submitted to compliance queue.');
  };

  // 2. EXECUTE WITHDRAWAL REQUEST (User-triggered)
  const handleAddWithdrawal = (amount: number, method: 'bank_wire' | 'crypto_usdt', pin?: string) => {
    if (!currentUser) return 'System session missing.';

    // Fetch user wallet
    const userWallet = wallets.find((w) => w.userId === currentUser.id);
    if (!userWallet) return 'Customer wallet not located.';

    if (amount > userWallet.availableBalance) {
      return 'Insufficient funds.';
    }

    // Deduct from available balance, place in pending balance
    const updatedWallets = wallets.map((w) => {
      if (w.userId === currentUser.id) {
        return {
          ...w,
          availableBalance: w.availableBalance - amount,
          pendingBalance: w.pendingBalance + amount
        };
      }
      return w;
    });

    const wthId = `wth-${Date.now()}`;
    const newRequest: WithdrawalRequest = {
      id: wthId,
      userId: currentUser.id,
      userName: currentUser.name,
      amount,
      method,
      status: 'pending',
      date: getFormattedDate(),
      reference: `WTH-${method.toUpperCase().slice(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const updatedWithdrawals = [newRequest, ...withdrawals];

    // Build notifications & log
    const notificationMessage = `Withdrawal request for $${amount.toLocaleString()} registered. Available checking assets deducted and locked in pending audit clearance.`;
    const auditMessage = `User requested outbound payout of $${amount.toLocaleString()} via ${method.toUpperCase()}.`;

    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId: currentUser.id,
      title: 'Outbound Payout Registered',
      message: notificationMessage,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'Request Withdrawal',
      targetUserId: currentUser.id,
      targetUserName: currentUser.name,
      details: auditMessage,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      transactions,
      deposits,
      updatedWithdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast('Outbound discharge submitted. Funds deducted from available.');
    return null;
  };

  // 3. EXECUTE PEER TRANSFER (User-triggered)
  const handleTransfer = (recipientId: string, amount: number) => {
    if (!currentUser) return;

    const targetUser = users.find((u) => u.id === recipientId);
    if (!targetUser) return;

    // Settle ledger balances
    const updatedWallets = wallets.map((w) => {
      if (w.userId === currentUser.id) {
        return {
          ...w,
          availableBalance: w.availableBalance - amount,
          mainBalance: w.mainBalance - amount
        };
      }
      if (w.userId === recipientId) {
        return {
          ...w,
          availableBalance: w.availableBalance + amount,
          mainBalance: w.mainBalance + amount
        };
      }
      return w;
    });

    // Create completed outbound transaction record
    const txOutId = `tx-out-${Date.now()}`;
    const txOut: BankTransaction = {
      id: txOutId,
      userId: currentUser.id,
      description: `Peer payment to ${targetUser.name}`,
      amount,
      date: getFormattedDate(),
      category: 'transfer',
      type: 'debit',
      status: 'completed',
      reference: `NEX-TRF-${Math.floor(10000 + Math.random() * 90000)}`
    };

    // Create completed inbound transaction record
    const txInId = `tx-in-${Date.now()}`;
    const txIn: BankTransaction = {
      id: txInId,
      userId: recipientId,
      description: `Peer payment from ${currentUser.name}`,
      amount,
      date: getFormattedDate(),
      category: 'transfer',
      type: 'credit',
      status: 'completed',
      reference: txOut.reference
    };

    const updatedTxs = [txOut, txIn, ...transactions];

    // Logs & notifications
    const notifOutId = `notif-out-${Date.now()}`;
    const notifOut: BankNotification = {
      id: notifOutId,
      userId: currentUser.id,
      title: 'Peer Ledger Settled',
      message: `Direct peer transfer of $${amount.toLocaleString()} to ${targetUser.name} executed in real-time.`,
      read: false,
      timestamp: getFormattedDate()
    };

    const notifInId = `notif-in-${Date.now()}`;
    const notifIn: BankNotification = {
      id: notifInId,
      userId: recipientId,
      title: 'Ledger Credited',
      message: `Direct peer transfer of $${amount.toLocaleString()} received from ${currentUser.name}.`,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'Peer Settle',
      targetUserId: recipientId,
      targetUserName: targetUser.name,
      details: `User executed direct peer payment of $${amount.toLocaleString()}.`,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      updatedTxs,
      deposits,
      withdrawals,
      [newLog, ...auditLogs],
      [notifOut, notifIn, ...notifications]
    );

    triggerToast(`Direct peer transfer settled! Handshake resolved.`);
  };

  // 4. USER BASIC DETAILS UPDATE (Settings-triggered)
  const handleUpdateUser = (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, ...updatedFields };
      }
      return u;
    });
    syncDatabase(
      updatedUsers,
      wallets,
      transactions,
      deposits,
      withdrawals,
      auditLogs,
      notifications
    );
  };

  // 5. DEPOSIT APPROVAL BY ADMIN
  const handleApproveDeposit = (reqId: string) => {
    const req = deposits.find((d) => d.id === reqId);
    if (!req) return;

    // Update Request status
    const updatedDeposits = deposits.map((d) => {
      if (d.id === reqId) return { ...d, status: 'approved' as const };
      return d;
    });

    // Update Wallet
    const updatedWallets = wallets.map((w) => {
      if (w.userId === req.userId) {
        return {
          ...w,
          mainBalance: w.mainBalance + req.amount,
          availableBalance: w.availableBalance + req.amount,
          pendingBalance: Math.max(0, w.pendingBalance - req.amount)
        };
      }
      return w;
    });

    // Generate Transaction Log
    const txId = `tx-dep-${Date.now()}`;
    const newTx: BankTransaction = {
      id: txId,
      userId: req.userId,
      description: `Inbound Deposit settled (${req.method.replace('_', ' ')})`,
      amount: req.amount,
      date: getFormattedDate(),
      category: 'deposit',
      type: 'credit',
      status: 'completed',
      reference: req.reference
    };

    const updatedTxs = [newTx, ...transactions];

    // Notification & Audit
    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId: req.userId,
      title: 'Deposit Approved & Cleared',
      message: `Your deposit request for $${req.amount.toLocaleString()} was approved and cleared into your available checking ledger.`,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Admin',
      action: 'Approve Deposit',
      targetUserId: req.userId,
      targetUserName: req.userName,
      details: `Approved & settled inbound deposit request of $${req.amount.toLocaleString()} via SWIFT/BIC or TRC-20 clearance rules.`,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      updatedTxs,
      updatedDeposits,
      withdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast(`Inbound ledger deposit of $${req.amount.toLocaleString()} cleared.`);
  };

  // 6. DEPOSIT REJECTION BY ADMIN
  const handleRejectDeposit = (reqId: string) => {
    const req = deposits.find((d) => d.id === reqId);
    if (!req) return;

    const updatedDeposits = deposits.map((d) => {
      if (d.id === reqId) return { ...d, status: 'rejected' as const };
      return d;
    });

    // Reduce pending balance on the wallet
    const updatedWallets = wallets.map((w) => {
      if (w.userId === req.userId) {
        return {
          ...w,
          pendingBalance: Math.max(0, w.pendingBalance - req.amount)
        };
      }
      return w;
    });

    // Log notification & Audit Log
    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId: req.userId,
      title: 'Deposit Rejected',
      message: `Your deposit request for $${req.amount.toLocaleString()} was rejected by administrative compliance audit. Please contact General Counsel.`,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Admin',
      action: 'Reject Deposit',
      targetUserId: req.userId,
      targetUserName: req.userName,
      details: `Compliance rejection of inbound deposit request of $${req.amount.toLocaleString()} due to routing or KYC verify failures.`,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      transactions,
      updatedDeposits,
      withdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast('Deposit request rejected.');
  };

  // 7. WITHDRAWAL APPROVAL BY ADMIN
  const handleApproveWithdrawal = (reqId: string) => {
    const req = withdrawals.find((w) => w.id === reqId);
    if (!req) return;

    // Update Withdrawal status
    const updatedWithdrawals = withdrawals.map((w) => {
      if (w.id === reqId) return { ...w, status: 'approved' as const };
      return w;
    });

    // Update Wallet
    const updatedWallets = wallets.map((w) => {
      if (w.userId === req.userId) {
        return {
          ...w,
          mainBalance: w.mainBalance - req.amount,
          pendingBalance: Math.max(0, w.pendingBalance - req.amount)
        };
      }
      return w;
    });

    // Create completed Transaction Log
    const txId = `tx-wth-${Date.now()}`;
    const newTx: BankTransaction = {
      id: txId,
      userId: req.userId,
      description: `Outbound Payout Settle (${req.method.replace('_', ' ')})`,
      amount: req.amount,
      date: getFormattedDate(),
      category: 'withdrawal',
      type: 'debit',
      status: 'completed',
      reference: req.reference
    };

    const updatedTxs = [newTx, ...transactions];

    // Notification & Audit
    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId: req.userId,
      title: 'Withdrawal Cleared & Settle',
      message: `Your outbound payout of $${req.amount.toLocaleString()} was approved and discharged to your external banking/crypto routes.`,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Admin',
      action: 'Approve Withdrawal',
      targetUserId: req.userId,
      targetUserName: req.userName,
      details: `Compliance approved outbound withdrawal settlement of $${req.amount.toLocaleString()} to external ledger destinations.`,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      updatedTxs,
      deposits,
      updatedWithdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast(`Withdrawal of $${req.amount.toLocaleString()} approved & discharged.`);
  };

  // 8. WITHDRAWAL REJECTION BY ADMIN
  const handleRejectWithdrawal = (reqId: string) => {
    const req = withdrawals.find((w) => w.id === reqId);
    if (!req) return;

    const updatedWithdrawals = withdrawals.map((w) => {
      if (w.id === reqId) return { ...w, status: 'rejected' as const };
      return w;
    });

    // Restore available balance, decrease pending balance
    const updatedWallets = wallets.map((w) => {
      if (w.userId === req.userId) {
        return {
          ...w,
          availableBalance: w.availableBalance + req.amount,
          pendingBalance: Math.max(0, w.pendingBalance - req.amount)
        };
      }
      return w;
    });

    // Notification & Audit
    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId: req.userId,
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request for $${req.amount.toLocaleString()} was rejected. Blocked assets restored to your available checking ledger.`,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Admin',
      action: 'Reject Withdrawal',
      targetUserId: req.userId,
      targetUserName: req.userName,
      details: `Compliance rejected outbound payout of $${req.amount.toLocaleString()} and restored balances back to client checking ledger.`,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      transactions,
      deposits,
      updatedWithdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast('Withdrawal request rejected. Funds returned to checking.');
  };

  // 9. ADMIN GENERAL LEDGER PROFILE DETAIL OVERRIDES
  const handleUpdateUserDetails = (userId: string, updates: Partial<UserProfile>) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const updatedUsers = users.map((u) => {
      if (u.id === userId) return { ...u, ...updates };
      return u;
    });

    // Build specific log messages
    let changedMessage = `Admin updated user details: `;
    Object.keys(updates).forEach((k) => {
      changedMessage += `[${k.toUpperCase()} set to ${updates[k as keyof UserProfile]}] `;
    });

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Admin',
      action: 'Override User Settings',
      targetUserId: userId,
      targetUserName: targetUser.name,
      details: changedMessage,
      timestamp: getFormattedDate()
    };

    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId: userId,
      title: 'Compliance Policy Overwritten',
      message: `Administration general counsel updated your profile policies or compliance flags.`,
      read: false,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      updatedUsers,
      wallets,
      transactions,
      deposits,
      withdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast(`Compliance policies synchronized for ${targetUser.name}.`);
  };

  // 10. ADMIN MANUAL ACCOUNT BALANCES LEDGER ADJUSTMENTS
  const handleAdjustWalletBalance = (userId: string, actionType: 'credit' | 'debit' | 'bonus' | 'adjust', amount: number) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const updatedWallets = wallets.map((w) => {
      if (w.userId === userId) {
        if (actionType === 'credit' || actionType === 'bonus') {
          return {
            ...w,
            mainBalance: w.mainBalance + amount,
            availableBalance: w.availableBalance + amount
          };
        } else if (actionType === 'debit') {
          return {
            ...w,
            mainBalance: Math.max(0, w.mainBalance - amount),
            availableBalance: Math.max(0, w.availableBalance - amount)
          };
        } else if (actionType === 'adjust') {
          return {
            ...w,
            mainBalance: amount,
            availableBalance: amount
          };
        }
      }
      return w;
    });

    // Create immediate Transaction Log
    const txId = `tx-adj-${Date.now()}`;
    const newTx: BankTransaction = {
      id: txId,
      userId,
      description: `Administrative adjustment: ${actionType.toUpperCase()}`,
      amount,
      date: getFormattedDate(),
      category: actionType === 'bonus' ? 'bonus' : 'adjustment',
      type: (actionType === 'credit' || actionType === 'bonus') ? 'credit' : 'debit',
      status: 'completed',
      reference: `ADJ-LEDG-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const updatedTxs = [newTx, ...transactions];

    // Notification & Audit trail
    const notifId = `notif-${Date.now()}`;
    const newNotif: BankNotification = {
      id: notifId,
      userId,
      title: 'Balance Ledger Overwrite',
      message: `Your balance ledger was administrative modified by general counsel: ${actionType.toUpperCase()} of $${amount.toLocaleString()}.`,
      read: false,
      timestamp: getFormattedDate()
    };

    const logId = `log-${Date.now()}`;
    const newLog: AuditLog = {
      id: logId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Admin',
      action: 'Adjust Balance Override',
      targetUserId: userId,
      targetUserName: targetUser.name,
      details: `Admin executed manual balance adjustments of $${amount.toLocaleString()} with policy: ${actionType.toUpperCase()}`,
      timestamp: getFormattedDate()
    };

    syncDatabase(
      users,
      updatedWallets,
      updatedTxs,
      deposits,
      withdrawals,
      [newLog, ...auditLogs],
      [newNotif, ...notifications]
    );

    triggerToast(`Ledger assets adjusted successfully.`);
  };

  // Notification read toggle helper
  const handleMarkNotifRead = (id: string) => {
    const updatedNotifs = notifications.map((n) => {
      if (n.id === id) return { ...n, read: true };
      return n;
    });
    syncDatabase(users, wallets, transactions, deposits, withdrawals, auditLogs, updatedNotifs);
  };

  // Helper variables mapped relative to active user session
  const activeUserWallet = wallets.find((w) => w.userId === currentUser?.id);
  const activeUserTransactions = transactions.filter((t) => t.userId === currentUser?.id);
  const activeUserNotifs = notifications.filter((n) => n.userId === currentUser?.id);
  const unreadNotifsCount = activeUserNotifs.filter((n) => !n.read).length;

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isDarkMode ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      
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

      {/* RENDER LOGIN / REGISTRATION ENVELOPE GATE */}
      {!currentUser ? (
        <AuthScreens
          usersList={users}
          onLoginSuccess={handleLoginSuccess}
          onRegisterUser={handleRegisterUser}
        />
      ) : (
        <>
          {/* PRIMARY CUSTODY HEADER BAR */}
          <header className={`sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b ${
            isDarkMode ? 'bg-zinc-900/85 border-zinc-800' : 'bg-white/85 border-slate-100'
          } backdrop-blur-md`}>
            
            {/* Left Brand and Navigation tabs list */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center border border-emerald-400">
                  <span className="font-display font-bold text-slate-950 text-base leading-none">N</span>
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white">NexaBank</span>
              </div>

              {/* Standard tabs selectors (hidden on mobile) */}
              <nav className="hidden lg:flex items-center gap-1.5">
                {currentUser.role !== 'admin' ? (
                  <>
                    <button
                      onClick={() => setCurrentTab('dashboard')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        currentTab === 'dashboard' 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-150/10'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" /> Dashboard
                    </button>
                    <button
                      onClick={() => setCurrentTab('deposit_withdraw')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        currentTab === 'deposit_withdraw' 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-150/10'
                      }`}
                      id="nav-deposit-withdraw"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Settle/Discharge
                    </button>
                    <button
                      onClick={() => setCurrentTab('transfer')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        currentTab === 'transfer' 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-150/10'
                      }`}
                      id="nav-transfer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Peer Settle
                    </button>
                    <button
                      onClick={() => setCurrentTab('history')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        currentTab === 'history' 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-150/10'
                      }`}
                      id="nav-history"
                    >
                      <History className="w-3.5 h-3.5" /> Historical ledger
                    </button>
                    <button
                      onClick={() => setCurrentTab('settings')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        currentTab === 'settings' 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-150/10'
                      }`}
                      id="nav-settings"
                    >
                      <Settings className="w-3.5 h-3.5" /> Security Panel
                    </button>
                  </>
                ) : (
                  <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold rounded-lg uppercase tracking-wider">
                    ● Regulatory Override Authority Active
                  </span>
                )}
              </nav>
            </div>

            {/* Right Status tickers, Notifications, Session user card */}
            <div className="flex items-center gap-4">
              
              {/* UTC clock ticker */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 px-3.5 py-1.5 rounded-xl font-mono text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                <span>{currentTime || '00:00:00 UTC'}</span>
              </div>

              {/* Notification drop trigger */}
              {currentUser.role !== 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationsInbox(!showNotificationsInbox)}
                    className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition"
                    id="btn-trigger-notif-dropdown"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white bg-rose-500 rounded-full">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown inbox panel */}
                  <AnimatePresence>
                    {showNotificationsInbox && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={`absolute right-0 mt-2.5 w-80 rounded-2xl border shadow-2xl p-4 z-40 text-left ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-150 text-slate-900'
                        }`}
                        id="notifications-dropdown-panel"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100/10 mb-3">
                          <span className="text-xs font-bold font-display">Notifications Ledger</span>
                          {unreadNotifsCount > 0 && (
                            <span className="text-[9px] font-mono font-bold text-indigo-500 uppercase">
                              {unreadNotifsCount} Unread
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                          {activeUserNotifs.length === 0 ? (
                            <p className="text-center py-6 text-slate-400 text-xs font-mono">NO INBOUND MESSAGES RECORDED</p>
                          ) : (
                            activeUserNotifs.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleMarkNotifRead(notif.id)}
                                className={`p-2.5 rounded-xl border transition cursor-pointer text-left ${
                                  notif.read 
                                    ? 'bg-transparent border-slate-100/5 text-slate-400' 
                                    : 'bg-indigo-500/5 border-indigo-500/20 text-slate-800 dark:text-zinc-200 font-medium'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="text-[11px] font-bold">{notif.title}</h5>
                                  <span className="text-[8px] font-mono text-slate-400">{notif.timestamp.split(' ')[1]}</span>
                                </div>
                                <p className="text-[10px] leading-normal">{notif.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

              {/* Log out & avatar */}
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-slate-200/50 object-cover"
                />
                <button
                  onClick={handleLogOut}
                  className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50/5 transition cursor-pointer"
                  title="Disconnect Session"
                  id="btn-logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>

          {/* RESPONSIVE SUB-TAB NAVIGATION RAIL FOR MOBILE INSTEAD OF COLLAPSED BURGERS */}
          <div className={`lg:hidden flex items-center justify-around border-b py-2 px-2 text-[10px] font-mono font-bold ${
            isDarkMode ? 'bg-zinc-900 border-zinc-850' : 'bg-white border-slate-150'
          }`}>
            {currentUser.role !== 'admin' ? (
              <>
                <button onClick={() => setCurrentTab('dashboard')} className={`px-2 py-1 rounded-md ${currentTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>OVERVIEW</button>
                <button onClick={() => setCurrentTab('deposit_withdraw')} className={`px-2 py-1 rounded-md ${currentTab === 'deposit_withdraw' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>DEPOSIT/PAYOUT</button>
                <button onClick={() => setCurrentTab('transfer')} className={`px-2 py-1 rounded-md ${currentTab === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>TRANSFER</button>
                <button onClick={() => setCurrentTab('history')} className={`px-2 py-1 rounded-md ${currentTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>HISTORY</button>
                <button onClick={() => setCurrentTab('settings')} className={`px-2 py-1 rounded-md ${currentTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>SETTINGS</button>
              </>
            ) : (
              <span className="text-emerald-400 font-semibold tracking-wider font-mono">GENERAL COUNSEL ADMIN BOARD</span>
            )}
          </div>

          {/* MAIN WEB PORTAL CONTENT CONTAINER */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
            
            {/* 1. COMPLIANCE WELCOME SECTION WITH REAL-TIME TOTAL WORTH NET SUMMARY */}
            {currentUser.role !== 'admin' && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                <div>
                  <h1 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    Welcome Back, {currentUser.name.split(' ')[0]}
                    {currentUser.isUpgraded && <Award className="w-5 h-5 text-indigo-500" />}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Your autonomous asset ledger and micro-settlement records are securely synchronized.
                  </p>
                </div>

                {/* Combined Portfolio Net Value Card */}
                {activeUserWallet && (
                  <div className={`p-4 rounded-3xl border flex items-center gap-5 shadow-sm min-w-[260px] ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
                  }`}>
                    <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shrink-0">
                      <BarChart3 className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block leading-normal">Total Assets Value</span>
                      <span className="text-xl font-display font-semibold tracking-tight text-slate-800 dark:text-white font-mono">
                        ${((activeUserWallet.availableBalance) + (activeUserWallet.savingsBalance)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-emerald-500 font-mono font-bold flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> +4.85% APY compounding
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Render appropriate views depending on currentTab */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                
                {/* A: REGULAR USER DASHBOARD */}
                {currentUser.role !== 'admin' && currentTab === 'dashboard' && activeUserWallet && (
                  <DashboardOverview
                    user={currentUser}
                    wallet={activeUserWallet}
                    transactions={activeUserTransactions}
                    onNavigate={(tab) => setCurrentTab(tab)}
                    isDarkMode={isDarkMode}
                  />
                )}

                {/* B: DEPOSIT / WITHDRAWAL TREASURY PORTAL */}
                {currentUser.role !== 'admin' && currentTab === 'deposit_withdraw' && activeUserWallet && (
                  <DepositWithdraw
                    user={currentUser}
                    wallet={activeUserWallet}
                    onAddDeposit={handleAddDeposit}
                    onAddWithdrawal={handleAddWithdrawal}
                    isDarkMode={isDarkMode}
                  />
                )}

                {/* C: TRANSFER FUNDING PORTAL */}
                {currentUser.role !== 'admin' && currentTab === 'transfer' && activeUserWallet && (
                  <TransferFunds
                    user={currentUser}
                    wallet={activeUserWallet}
                    usersList={users}
                    onTransfer={handleTransfer}
                    isDarkMode={isDarkMode}
                  />
                )}

                {/* D: FULL TRANSACTIONS HISTORY PORTAL */}
                {currentUser.role !== 'admin' && currentTab === 'history' && (
                  <TransactionsHistory
                    transactions={activeUserTransactions}
                    isDarkMode={isDarkMode}
                  />
                )}

                {/* E: ACCOUNT & SAFETY CONFIG SETTINGS */}
                {currentUser.role !== 'admin' && currentTab === 'settings' && (
                  <SettingsPanel
                    user={currentUser}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    onUpdateUser={handleUpdateUser}
                    onAddAuditLog={(act, det) => handleAddAuditLog(act, det, currentUser)}
                  />
                )}

                {/* F: COMPREHENSIVE ADMINISTRATIVE CONTROLS PANEL */}
                {currentUser.role === 'admin' && currentTab === 'admin' && (
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
                  />
                )}

              </motion.div>
            </AnimatePresence>

          </main>

          {/* METRIC CARD FOOTER SECURED AD */}
          <footer className={`py-6 text-center text-xs mt-auto border-t ${
            isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500' : 'bg-white border-slate-100 text-slate-400'
          }`}>
            <p>© 2026 NexaBank Custody Technologies Inc. Settle and trade simulated assets under Sandbox regulations.</p>
          </footer>
        </>
      )}

    </div>
  );
}
