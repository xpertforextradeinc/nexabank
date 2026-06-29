# NexaBank API Integration Guide

This document details the Supabase client-side API integrations, remote procedure calls (RPC), and ledger query patterns utilized inside NexaBank.

---

## 🔒 Authentication APIs

Authentication utilizes the Supabase SDK wrappers around the standard GoTrue service.

### 1. Email Sign-Up
Creates a new login session and triggers the automatic database onboarding mechanism (`handle_new_user`).
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'customer@email.com',
  password: 'SecurePassword123',
  options: {
    data: {
      full_name: 'Jane Doe',
      withdrawal_pin: '4321', // Optional, will auto-generate if omitted
    }
  }
});
```
*   **Response Payload (Success)**:
    ```json
    {
      "user": {
        "id": "8b9f7a01-4c12-4299-8d11-e94917a1b023",
        "email": "customer@email.com",
        "email_confirmed_at": "2026-06-29T10:15:00.000Z",
        "user_metadata": {
          "full_name": "Jane Doe",
          "withdrawal_pin": "4321"
        }
      },
      "session": {
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "d8a1c9b2-3210...",
        "expires_in": 3600
      }
    }
    ```

### 2. Email Sign-In
Authenticates credentials and opens a session.
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'customer@email.com',
  password: 'SecurePassword123'
});
```

### 3. Google OAuth Sign-In
Directs the browser to Google's sign-in consent flow.
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin
  }
});
```

---

## 💼 Wallet & Account APIs

Checking, savings, and virtual card boundaries are stored inside the `wallets` entity.

### 1. Fetch Active Balance
Retrieves checking, available, pending, and savings vault balances.
```typescript
const { data, error } = await supabase
  .from('wallets')
  .select('main_balance, available_balance, pending_balance, savings_balance')
  .eq('user_id', userId)
  .single();
```
*   **Response Payload**:
    ```json
    {
      "main_balance": 15490.50,
      "available_balance": 15490.50,
      "pending_balance": 0.00,
      "savings_balance": 25000.00
    }
    ```

### 2. Move Funds to Savings Vault
Programmatically moves money from checking to savings.
```typescript
// Example: Moving $500.00 to Savings
const { error } = await supabase
  .from('wallets')
  .update({
    available_balance: currentAvailable - 500.00,
    main_balance: currentMain - 500.00,
    savings_balance: currentSavings + 500.00
  })
  .eq('user_id', userId);
```

---

## 📥 Deposit APIs

Inbound funds are requested in the sandbox and reviewed by admins.

### 1. Request Deposit
Creates a pending deposit ledger row.
```typescript
const { data, error } = await supabase
  .from('deposits')
  .insert({
    user_id: userId,
    user_name: 'Jane Doe',
    amount: 1500.00,
    method: 'bank_wire', // Allowed values: 'bank_wire', 'crypto_usdt', 'credit_card'
    status: 'pending',
    reference: 'NEX-DEP-49102'
  });
```

---

## 📤 Withdrawal APIs

Allows users to file transfer payouts, validating with PIN.

### 1. Request Withdrawal
Registers an audit row awaiting manual compliance clearance.
```typescript
const { data, error } = await supabase
  .from('withdrawals')
  .insert({
    user_id: userId,
    user_name: 'Jane Doe',
    amount: 250.00,
    method: 'crypto_usdt', // Allowed values: 'bank_wire', 'crypto_usdt'
    status: 'pending',
    reference: 'NEX-WTH-84912'
  });
```

---

## 💸 Peer-to-Peer Transfer APIs

Funds movements are processed through SQL execution blocks inside the `transfer_funds` database function to prevent double-spending.

### 1. Execute Atomic P2P Transfer
Calls the SQL transactional transfer procedure.
```typescript
const { data, error } = await supabase.rpc('transfer_funds', {
  p_recipient_id: 'e29bf1b8-c31a-4299-bbd1-49a8f2c3b290', // Recipient User ID
  p_amount: 100.00
});
```
*   **Response Payload (Success)**:
    ```json
    {
      "success": true,
      "reference": "NEX-TRF-48192"
    }
    ```
*   **Response Payload (Insufficient Balance Error)**:
    ```json
    {
      "code": "P0001",
      "message": "Insufficient funds in sender account"
    }
    ```

---

## 🛡️ Administrative APIs

Protected interfaces only executable by users listed in the `admin_users` register.

### 1. Fetch Audit Log History
Retrieves security audit history entries.
```typescript
const { data, error } = await supabase
  .from('audit_logs')
  .select('*')
  .order('timestamp', { ascending: false });
```

### 2. Approve Deposit
Verifies and approves an inbound transfer request. This executes atomic balance increments.
```typescript
// Phase 1: Update status to 'approved'
await supabase
  .from('deposits')
  .update({ status: 'approved' })
  .eq('id', depositId);

// Phase 2: Add funds to target wallet
await supabase
  .from('wallets')
  .update({
    available_balance: targetWallet.available_balance + amount,
    main_balance: targetWallet.main_balance + amount
  })
  .eq('user_id', targetUserId);
```

For more details on database tables or visual styles, see:
*   [Database Spec](./DATABASE.md)
*   [Styling & UI Guide](./STYLE_GUIDE.md)

---

**Author**: Luckman World
