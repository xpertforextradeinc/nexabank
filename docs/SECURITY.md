# NexaBank Security & Compliance Specification

This document details the security architecture, authorization parameters, cryptographic boundaries, and compliance tracking engines active inside NexaBank.

---

## 🔐 Authentication & Session Hardening

NexaBank leverages enterprise-grade JSON Web Token (JWT) flows orchestrated by Supabase Auth (GoTrue identity service).

1.  **Transport Security (TLS)**: All client-to-server traffic is encrypted using HTTPS and secure WebSockets (WSS).
2.  **JWT Verification**: When a user registers or logs in, Supabase issues an asymmetric RSA-256 signed access token (JWT) containing standard claims (`iss`, `sub`, `exp`, `email`) along with customizable user metadata parameters.
3.  **Active Session Sync**: The React application captures auth events via `supabase.auth.onAuthStateChange()`, updating internal memory states immediately when tokens expire or are revoked.
4.  **Third-Party Authentication**: Google Sign-In is managed using standard OAuth 2.0 redirection flows, routing safe callbacks to secure callback endpoints.

---

## 👥 Role-Based Access Control (RBAC)

NexaBank enforces a strict, isolated Role-Based Access Control (RBAC) boundary between standard **Customers** and **System Administrators**:

```
[ Unauthenticated Public Space ]
                │
         (Auth Challenge)
                ▼
  [ Authenticated Session Enclave ]
         /               \
   (User Role)       (Admin Role)
       /                   \
      ▼                     ▼
[Customer View]     [Admin Compliance View]
 - Move local funds   - View ALL Audit Logs
 - Request Transfers  - Approve/Reject Wire Deposits
 - Virtual Cards      - Modify User Profile Locks
```

1.  **Database Level Lockdowns**: The `admin_users` table maintains a cached, high-speed directory of verified administrators. This prevents spoofing; any profile claiming to be an admin must have a corresponding index in `admin_users`.
2.  **UI/UX Router Isolation**: Component routes are guarded. If a non-admin attempts to view administrative routes, the layout renders a fallback access denied component, preventing unauthorized script execution.

---

## 🛡️ PostgreSQL Row Level Security (RLS)

Every table inside the NexaBank database has Row Level Security enabled. Standard users are structurally isolated at the query interpreter level; they can never read, modify, or delete another user's banking ledger.

### Example: Profiles RLS Policies
```sql
-- Enforces that users can only select or update their own specific rows,
-- while allowing cached admin accounts full inspection rights.
CREATE POLICY "Users can select their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
```

### Table Security Metrics

| Table | RLS Active | Customer Scope | Admin Scope |
| :--- | :---: | :--- | :--- |
| `profiles` | **Yes** | Read/Update matching own ID | Read/Update/Insert any row |
| `wallets` | **Yes** | Read matching own ID (Writes blocked) | Read/Write any row |
| `transactions` | **Yes**| Read matching own ID (Writes blocked) | Read/Write any row |
| `deposits` | **Yes** | Read/Insert matching own ID | Read/Update any row |
| `withdrawals` | **Yes** | Read/Insert matching own ID | Read/Update any row |
| `notifications` | **Yes** | Full access to matching own ID | Read/Write any row |
| `audit_logs` | **Yes** | Blocked entirely (Read-only to admins) | Read-only |
| `admin_users` | **Yes** | Read-only to authenticated users | Full access |
| `transfer_history` | **Yes** | Read if Sender or Receiver ID matches | Full access |

---

## 🔑 Challenge Verification & PIN Security

To protect outbound capital movements (withdrawals and P2P transfers), NexaBank implements a dedicated PIN challenge verification screen.

1.  **PIN Initialization**: During onboarding, a unique 4-digit PIN is generated and assigned to the user profile's metadata payload, which is then mapped to `profiles.withdrawal_pin`.
2.  **Dynamic Challenge UI**: Any outbound transfer or withdrawal action triggers a high-security visual PIN pad overlay. Funds are only routed to the postgres transaction layers after the inputted PIN is compared and verified against the user's secure database profile.
3.  **Account Lockdowns**: Administrators can freeze a user's withdrawals instantly using the `withdrawals_locked` flag in the `profiles` table. Any attempt to request money will immediately trigger a database exception, blocking the transaction before it is written.

---

## 📝 Immutable Audit Logging

Compliance monitoring is critical to secure banking. NexaBank records all high-priority administrative adjustments in the `audit_logs` table:

*   **Immutable Ledger**: The `audit_logs` table has no `UPDATE` or `DELETE` RLS policies. Once written, a log can never be removed or modified.
*   **Comprehensive Diagnostics**: Log entries record the performer's ID/Name, action description (e.g. `Peer Settle`), targeted account coordinates, updated statuses, and exact UTC timestamps.
*   **Admin Console Trailing**: Audit entries are displayed in real-time on the administrator compliance console, ensuring operations are fully auditable.

---

## 💻 Secure Coding Practices

NexaBank prevents common application vulnerabilities through the following mechanisms:

1.  **No Injection (SQL Prepared Statements)**: Direct query text concatenation is strictly prohibited. The Supabase client automatically executes parameterized queries, mitigating SQL Injection risks.
2.  **No Direct State Mutators for Balances**: Frontend variables do not determine wallet balances. The application always queries the verified state directly from PostgreSQL, and mutations are handled on-chain using secure SQL triggers and functions (`transfer_funds`).
3.  **Input Sanitation**: Interactive input fields (such as transfers and withdrawals) enforce strict numerical bounds, format verification, and balance checks before passing inputs to the client API wrapper.

For more information on relational architectures or deployment parameters, refer to:
*   [Relational Database Specification](./DATABASE.md)
*   [Production Deployment Manual](./DEPLOYMENT.md)

---

**Author**: Luckman World
