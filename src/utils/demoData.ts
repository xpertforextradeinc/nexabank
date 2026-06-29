import { UserProfile, Wallet, BankTransaction, DepositRequest, WithdrawalRequest, AuditLog, BankNotification } from '../types';

export const SEED_USERS: UserProfile[] = [
  {
    id: 'u-1',
    name: 'Elitist Earner',
    email: 'elitedailyearnings@gmail.com',
    role: 'user',
    status: 'active',
    withdrawalPinRequired: true,
    withdrawalPin: '4890',
    isUpgraded: true,
    phone: '+1 (555) 349-8092',
    mfaEnabled: true,
    verificationStatus: 'verified',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    joinedDate: 'Jan 12, 2026',
  },
  {
    id: 'u-2',
    name: 'Sophia Chen',
    email: 'sophia@nexabank.com',
    role: 'user',
    status: 'active',
    withdrawalPinRequired: false,
    isUpgraded: false,
    phone: '+1 (555) 712-4456',
    mfaEnabled: false,
    verificationStatus: 'pending',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    joinedDate: 'Mar 24, 2026',
  },
  {
    id: 'u-3',
    name: 'Marcus Sterling',
    email: 'marcus@nexabank.com',
    role: 'user',
    status: 'frozen',
    withdrawalPinRequired: true,
    withdrawalPin: '1122',
    isUpgraded: false,
    phone: '+1 (555) 890-1122',
    mfaEnabled: true,
    verificationStatus: 'unverified',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    joinedDate: 'May 05, 2026',
  },
  {
    id: 'u-admin',
    name: 'Nexa Chief Administrator',
    email: 'admin@nexabank.com',
    role: 'admin',
    status: 'active',
    withdrawalPinRequired: false,
    isUpgraded: true,
    phone: '+1 (800) 555-NEXA',
    mfaEnabled: true,
    verificationStatus: 'verified',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    joinedDate: 'Jan 01, 2025',
  }
];

export const SEED_WALLETS: Wallet[] = [
  {
    userId: 'u-1',
    mainBalance: 12450.00,
    availableBalance: 12450.00,
    pendingBalance: 1500.00,
    savingsBalance: 45000.00,
  },
  {
    userId: 'u-2',
    mainBalance: 3200.50,
    availableBalance: 3200.50,
    pendingBalance: 0.00,
    savingsBalance: 12000.00,
  },
  {
    userId: 'u-3',
    mainBalance: 98400.00,
    availableBalance: 0.00, // Frozen! Available is 0
    pendingBalance: 5000.00,
    savingsBalance: 25000.00,
  },
  {
    userId: 'u-admin',
    mainBalance: 9999999.00,
    availableBalance: 9999999.00,
    pendingBalance: 0.00,
    savingsBalance: 0.00,
  }
];

export const SEED_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'tx-101',
    userId: 'u-1',
    description: 'Stripe Merchant Payout',
    amount: 1420.00,
    date: '2026-06-28 14:32',
    category: 'salary',
    type: 'credit',
    status: 'completed',
    reference: 'NEX-STRIPE-9204A'
  },
  {
    id: 'tx-102',
    userId: 'u-1',
    description: 'Uber Eats Deliveries',
    amount: 34.50,
    date: '2026-06-27 19:11',
    category: 'food',
    type: 'debit',
    status: 'completed',
    reference: 'NEX-UBER-7712C'
  },
  {
    id: 'tx-103',
    userId: 'u-1',
    description: 'GitHub Copilot Monthly',
    amount: 10.00,
    date: '2026-06-26 04:00',
    category: 'shopping',
    type: 'debit',
    status: 'completed',
    reference: 'NEX-GITH-0129F'
  },
  {
    id: 'tx-104',
    userId: 'u-1',
    description: 'Tesla Supercharger charging',
    amount: 18.25,
    date: '2026-06-25 11:45',
    category: 'utilities',
    type: 'debit',
    status: 'completed',
    reference: 'NEX-TESL-3341P'
  },
  {
    id: 'tx-105',
    userId: 'u-1',
    description: 'Incoming Bank Wire',
    amount: 5000.00,
    date: '2026-06-24 09:15',
    category: 'deposit',
    type: 'credit',
    status: 'completed',
    reference: 'NEX-WIRE-0012Z'
  },
  {
    id: 'tx-201',
    userId: 'u-2',
    description: 'Design Services Consulting',
    amount: 1800.00,
    date: '2026-06-28 10:00',
    category: 'salary',
    type: 'credit',
    status: 'completed',
    reference: 'NEX-CONS-5512B'
  },
  {
    id: 'tx-202',
    userId: 'u-2',
    description: 'Adobe Creative Cloud',
    amount: 54.99,
    date: '2026-06-25 08:30',
    category: 'shopping',
    type: 'debit',
    status: 'completed',
    reference: 'NEX-ADOB-1122W'
  }
];

export const SEED_DEPOSITS: DepositRequest[] = [
  {
    id: 'dep-1',
    userId: 'u-1',
    userName: 'Elitist Earner',
    amount: 1500.00,
    method: 'bank_wire',
    status: 'pending',
    date: '2026-06-29 02:40',
    reference: 'DEP-WIRE-24156'
  },
  {
    id: 'dep-2',
    userId: 'u-2',
    userName: 'Sophia Chen',
    amount: 450.00,
    method: 'credit_card',
    status: 'approved',
    date: '2026-06-27 15:20',
    reference: 'DEP-CARD-11925'
  }
];

export const SEED_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wth-1',
    userId: 'u-1',
    userName: 'Elitist Earner',
    amount: 2500.00,
    method: 'crypto_usdt',
    status: 'pending',
    date: '2026-06-29 05:10',
    reference: 'WTH-USDT-90013'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorId: 'u-admin',
    actorName: 'Nexa Chief Administrator',
    action: 'Freeze Account',
    targetUserId: 'u-3',
    targetUserName: 'Marcus Sterling',
    details: 'Placed account in frozen state pending AML high-value compliance verification.',
    timestamp: '2026-06-28 11:45'
  },
  {
    id: 'log-2',
    actorId: 'u-admin',
    actorName: 'Nexa Chief Administrator',
    action: 'Generate Withdrawal PIN',
    targetUserId: 'u-1',
    targetUserName: 'Elitist Earner',
    details: 'Enforced safety policy. Withdrawal PIN set to 4890.',
    timestamp: '2026-06-27 14:10'
  }
];

export const SEED_NOTIFICATIONS: BankNotification[] = [
  {
    id: 'notif-1',
    userId: 'u-1',
    title: 'Account Upgraded',
    message: 'Congratulations! Your NexaBank ledger has been upgraded to Premium Status.',
    read: false,
    timestamp: '2026-06-28 09:00'
  },
  {
    id: 'notif-2',
    userId: 'u-1',
    title: 'Pending Deposit',
    message: 'Your $1,500.00 Bank Wire deposit is currently awaiting administrative audit clearance.',
    read: true,
    timestamp: '2026-06-29 02:41'
  }
];

// Helper to load or initialize storage database
export function initializeBankDatabase() {
  if (typeof window === 'undefined') return;

  const storageKeys = {
    users: 'nexabank_users',
    wallets: 'nexabank_wallets',
    transactions: 'nexabank_transactions',
    deposits: 'nexabank_deposits',
    withdrawals: 'nexabank_withdrawals',
    auditLogs: 'nexabank_audit',
    notifications: 'nexabank_notifications'
  };

  if (!localStorage.getItem(storageKeys.users)) {
    localStorage.setItem(storageKeys.users, JSON.stringify(SEED_USERS));
    localStorage.setItem(storageKeys.wallets, JSON.stringify(SEED_WALLETS));
    localStorage.setItem(storageKeys.transactions, JSON.stringify(SEED_TRANSACTIONS));
    localStorage.setItem(storageKeys.deposits, JSON.stringify(SEED_DEPOSITS));
    localStorage.setItem(storageKeys.withdrawals, JSON.stringify(SEED_WITHDRAWALS));
    localStorage.setItem(storageKeys.auditLogs, JSON.stringify(SEED_AUDIT_LOGS));
    localStorage.setItem(storageKeys.notifications, JSON.stringify(SEED_NOTIFICATIONS));
  }
}
