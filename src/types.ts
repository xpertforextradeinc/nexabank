export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'frozen' | 'hold';
  withdrawalPinRequired: boolean;
  withdrawalPin?: string;
  isUpgraded: boolean;
  phone: string;
  mfaEnabled: boolean;
  mfaCode?: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  avatar: string;
  joinedDate: string;
  withdrawalsLocked?: boolean;
  // Step 1 - Personal Details
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  // Step 2 - Address
  country?: string;
  stateProvince?: string;
  city?: string;
  zipPostalCode?: string;
  residentialAddress?: string;
  // Step 3 - Financial Profile
  employmentStatus?: string;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  sourceFunds?: string;
  // Step 4 - Identity
  govIdType?: string;
  govIdNumber?: string;
  nationalIdSsn?: string;
  uploadedIdUrl?: string;
  // Generated Core Banking Numbers
  accountNumber?: string;
  routingNumber?: string;
  
  // Tax Filing Info
  taxLegalName?: string;
  taxDob?: string;
  taxFilingStatus?: string;
  taxAddress?: string;
  taxSubmitted?: boolean;
  
  // Admin Assigned Crypto Wallet
  assignedCryptoWallet?: string;
}

export interface Wallet {
  userId: string;
  mainBalance: number;
  availableBalance: number;
  pendingBalance: number;
  savingsBalance: number;
}

export interface BankTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: string;
  category: 'deposit' | 'withdrawal' | 'transfer' | 'bonus' | 'adjustment' | 'shopping' | 'food' | 'salary' | 'utilities';
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'bank_wire' | 'crypto_usdt' | 'credit_card';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  reference: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'bank_wire' | 'crypto_usdt' | 'cash_app' | 'zelle' | 'venmo';
  status: 'pending' | 'approved' | 'rejected' | 'deposit_required';
  date: string;
  reference: string;
  payload?: any;
  requiredDepositAmount?: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetUserId: string;
  targetUserName: string;
  details: string;
  timestamp: string;
}

export interface BankNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// Old backward-compatibility types for previous session components
export interface AccountBalances {
  checking: number;
  savings: number;
  investment: number;
}

export interface CreditCard {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  isFrozen: boolean;
  color: 'emerald' | 'slate' | 'indigo' | 'amber';
  balance: number;
  limit: number;
}

export interface SavingsGoal {
  name: string;
  current: number;
  target: number;
  category: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'expense' | 'income';
  status: 'completed' | 'pending' | 'failed';
}
