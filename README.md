# 🏛️ NexaBank

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black.svg?style=flat&logo=vercel)](https://vercel.com/)

NexaBank is a premium, enterprise-grade digital banking simulation platform built with contemporary web technologies. It delivers an immersive, high-fidelity experience modeled after elite digital financial institutions. While NexaBank operates in **Demo/Sandbox Mode** with simulated assets and ledgers, its structural integrity, security practices, and responsive visual interfaces are designed to production-quality standards.

> ⚠️ **Development Note:** NexaBank is intended strictly for development, demonstration, and educational purposes. No real currency is processed, stored, or transacted.

---

## ✨ Features

NexaBank is engineered with a wide spectrum of contemporary banking capabilities:

*   **🔒 Secure Multi-Factor Authentication**: Seamless authentication flows managed by Supabase, including email/password sign-in and OAuth-based Google Sign-In.
*   **👥 Role-Based Access Control (RBAC)**: Distinct permission sets for standard **Customers** and **System Administrators** enforcing strict UI/UX segregation.
*   **📈 Customer Command Center**: A comprehensive dashboard showing dynamic balances (Checking vs. Savings Vault), simulated investment yields, visual trend charts, and real-time transaction feeds.
*   **🛡️ Dedicated Compliance & Admin Dashboard**: A protected, separate portal for administrators to audit system logs, approve or reject SWIFT/Crypto deposit handshakes, clear withdrawal PIN releases, and manage accounts.
*   **💳 Dynamic Wallet & Debit Card Interface**: Interactive virtual card management, instant card freeze/unfreeze controls, transaction limit settings, and customizable design presets.
*   **💸 Peer-to-Peer (P2P) Bank Transfers**: Instant local transfers between NexaBank accounts using routing and account numbers, verified in real-time with internal ledgers.
*   **📥 Sophisticated Deposit Workflows**: Multi-channel simulated funding options via SWIFT International Wire or USD Coin (USDC-TRC20) with compliant admin verification steps.
*   **📤 PIN-Challenged Withdrawals**: Secure, compliance-monitored withdrawal requests utilizing high-security PIN requirements and admin clearances.
*   **🎯 Goal-Based Savings Vaults**: Target-driven savings buckets supporting programmatic checking-to-savings transfers.
*   **🔔 Real-Time Notification Center**: Event-driven notification trays dispatching immediate ledger alerts for transfers, compliance holds, admin approvals, and logins.
*   **📝 Cryptographic Audit Logging**: Immutable administrative and system logs recording critical platform interactions to ensure full accountability.
*   **📱 Universal Mobile-First Interface**: An elegant, responsive layout optimized meticulously for desktop, tablet, and mobile screens.

---

## 🛠️ Technology Stack

*   **Runtime Environment**: React 18+ powered by **Vite** for optimized, blisteringly fast compilation and asset delivery.
*   **Programming Language**: **TypeScript** (Strict Mode) guaranteeing runtime safety and rich autocompletion.
*   **Styling Engine**: **Tailwind CSS** implementing a bespoke design system featuring modern palettes and customizable layouts.
*   **Backend & Orchestration**: **Supabase** providing stateful session management, instant data channels, and relational queries.
*   **Database**: **PostgreSQL** running on Supabase with normalized relations and structured constraints.
*   **Security Policies**: PostgreSQL **Row Level Security (RLS)** ensuring isolated query containment on database-level operations.
*   **Data Visualization**: **Recharts** rendering fluid SVG-based financial performance vectors and balance trajectories.
*   **Animations**: **Motion (Framer Motion)** driving high-performance micro-interactions, layout transitions, and fluid sidebar translations.

---

## 📐 Architecture

```
                          ┌───────────────────────────┐
                          │     Client Application    │
                          │   (React / TypeScript)    │
                          └─────────────┬─────────────┘
                                        │
                         HTTP & WebSocket Connections
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │          Supabase Client Layer            │
                  └─────────────┬──────────────────────┬──────┘
                                │                      │
                        Authentication          Database Queries
                                │                      │
                                ▼                      ▼
                  ┌───────────────────────────┐ ┌──────────────┴────────────┐
                  │    Supabase Auth Engine   │ │     PostgreSQL Database   │
                  │   (GoTrue Identity API)   │ │  Enforced by RLS Policies │
                  └───────────────────────────┘ └───────────────────────────┘
```

### 🔑 Authentication & Session State
Authentication is anchored by Supabase's secure token system. The application handles session synchronization on load, refreshing tokens automatically. The client maintains standard state hooks backed by an active Supabase subscription to ensure UI updates dynamically whenever a user logs in, logs out, or modifies their profile.

### 💾 Relational Database Schema
Database integrity is preserved through several strictly structured SQL tables:
*   `profiles`: Custom customer data (Legal names, SSN/ID records, custom routing/account coordinates).
*   `wallets`: Checking accounts, savings vault assets, and virtual card states.
*   `transactions`: Complete peer-to-peer records, debit purchases, and yield logs.
*   `deposits` & `withdrawals`: Ledger entries detailing cash-flow requests awaiting compliance verification.
*   `notifications`: User-specific notification records.
*   `audit_logs`: Immutable security-relevant events visible to Administrators.

### 🛡️ Enterprise Security Model
1.  **Row Level Security (RLS)**: Database tables enforce strict PostgreSQL security policies. A customer can *only* select or insert rows containing their unique `user_id`. Administrators are authenticated with specific metadata parameters and granted custom bypass/read credentials.
2.  **Strict Token Inspection**: Every transaction, profile update, and audit log write is validated against the active token of the signed-in caller.
3.  **Client Protection**: Admin-specific components are blocked on the router level, preventing unauthorized script execution.

---

## 📂 Project Structure

```
├── .env.example             # Documented template for system environment configuration
├── vite.config.ts           # Bundler configuration supporting multi-prefix environment scopes
├── tsconfig.json            # Strict TypeScript compilation rules
├── index.html               # Main application entry canvas
├── src/
│   ├── main.tsx             # Global bootstrapping and React DOM rendering
│   ├── App.tsx              # Application core router, global state, and ledger engines
│   ├── types.ts             # Shared structured TypeScript interface declarations
│   ├── index.css            # Tailwind CSS direct imports and customized font/theme parameters
│   ├── lib/
│   │   └── supabase.ts      # Multi-fallback, production-ready Supabase Client initializer
│   ├── components/
│   │   ├── AuthScreens.tsx  # Interactive customer login, registration, and password forms
│   │   └── ErrorBoundary.tsx# Safe rendering boundaries protecting runtime performance
│   └── utils/
│       └── format.ts        # Modular formatters for currency, dates, and account numbers
└── supabase/
    └── migrations/          # Versioned database schemas, triggers, and RLS rule scripts
```

---

## 🚀 Installation & Setup

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed locally before proceeding.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nexabank.git
cd nexabank
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Configure Your Environment Keys
Create a `.env` file in the root folder of the project. Do **not** commit this file to version control.
```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase endpoint values:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-public-anon-key"
```

### 4. Boot the Development Server
```bash
npm run dev
```
NexaBank will be active at `http://localhost:3000`.

### 5. Compile a Production Bundle
```bash
npm run build
```
Vite will compile and output clean, optimized HTML, JS, and CSS files to the `/dist` directory.

---

## ⚙️ Environment Variables

The application contains fallback variables to prevent client crashes during setup. For production, configure these variables in your host environment (Vercel, Cloud Run, Netlify):

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | `https://placeholder-url.supabase.co` | The unique API endpoint URL of your Supabase project. |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | `placeholder-anon-key` | The public, anonymous API key of your Supabase project. |

*Note: NexaBank's environment engine is pre-configured to automatically recognize standard variations including `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL` to prevent configuration mismatches.*

---

## 🔐 Security Engineering

*   **Data Enclave Separation**: Users can only query their own accounts. Row-Level Security checks are executed by PostgreSQL at the database level.
*   **Role Invalidation**: Admin views and operations reject requests originating from non-admin security scopes.
*   **Sanitized Transfers**: Balance modifications are guarded using SQL transactional rules or validated through rigorous state locks.
*   **Support & PIN Audits**: Admin actions such as unlocking PIN challenges are permanently logged in the public ledger audit timeline.

---

## 💻 Screenshots

Below are placeholders for the primary visual stages of the NexaBank experience:

### 1. Unified Access Portal (Login)
```
┌────────────────────────────────────────────────────────┐
│                      NEXABANK                          │
│                                                        │
│               [  Access Your Account  ]                │
│                                                        │
│   Email Address                                        │
│   [─────────────────────────────────────────────────]  │
│   Password                                             │
│   [─────────────────────────────────────────────────]  │
│                                                        │
│            ┌───────────────────────────────┐           │
│            │            Sign In            │           │
│            └───────────────────────────────┘           │
│             Or authenticate with Google G              │
└────────────────────────────────────────────────────────┘
```

### 2. Registration & Onboarding
```
┌────────────────────────────────────────────────────────┐
│                      NEXABANK                          │
│                                                        │
│                 [ Open New Account ]                   │
│                                                        │
│   Full Name           Email Address                    │
│   [───────────────]   [─────────────────────────]      │
│   ID Upload (URL)     National Security Number         │
│   [───────────────]   [─────────────────────────]      │
│                                                        │
│            ┌───────────────────────────────┐           │
│            │        Submit Application     │           │
│            └───────────────────────────────┘           │
└────────────────────────────────────────────────────────┘
```

### 3. Customer Dashboard & Core Ledgers
```
┌────────────────────────────────────────────────────────┐
│  NEXABANK | Dashboard                       Logout [X] │
├────────────────────────────────────────────────────────┤
│  Available checking: $12,490.50                        │
│  Savings Vault Balance: $45,000.00 [Move Funds]        │
├────────────────────────────────────────────────────────┤
│  [Accounts] [Transactions] [Virtual Cards] [Deposit]   │
├────────────────────────────────────────────────────────┤
│  Latest Transactions                                   │
│  - Peer Transfer to User ID #84931  - $150.00          │
│  - Monthly Yield (0.85% APY Credit)  + $31.84          │
└────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap

Future enhancements planned for subsequent platform cycles:

*   [ ] **Comprehensive Investment Accounts**: Integration of simulated asset indices and real-time paper stock trading markets.
*   [ ] **Biometric Passkey Authentication**: Expanding multi-factor configurations using fingerprint and face verification APIs.
*   [ ] **Core Yield Engines (Smart Dividends)**: Configurable multi-tiered APY rates based on account status tiers (Elite vs Standard).
*   [ ] **Automated PDF Statements**: Generation and secure downloading of monthly simulated ledger statements.

---

## 🤝 Contributing

Contributions are welcome! Please follow these standards:

1.  **Strict Lint Verification**: Run `npm run lint` before committing. Ensure code contains zero compilation warnings.
2.  **No Mock Fallbacks**: Avoid adding mock state modules. Keep actions tied to standard database triggers and schemas.
3.  **Modular Components**: Keep files small and highly specialized. Extract repeatable elements into their own modules.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## 👤 Author

*   **Name**: NexaBank Architecture Team
*   **Email**: support@nexabank.io
*   **Website**: [nexabank.io](https://nexabank.io)
