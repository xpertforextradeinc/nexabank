# NexaBank Production Deployment Manual

This document details how to spin up NexaBank locally, configure environmental keys, execute Supabase database schemas, wire Google OAuth, and deploy to production-grade environments like Vercel.

---

## 💻 Local Development Setup

Follow these steps to run the application on your local machine:

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js (v18+)](https://nodejs.org/)
*   [npm (v10+)](https://www.npmjs.com/)
*   A [Supabase Account](https://supabase.com/) and a fresh project.

### 2. Initialization
```bash
git clone https://github.com/your-username/nexabank.git
cd nexabank
npm install
```

### 3. Setup Local Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Fill in the parameters with your project's unique identifiers from your Supabase Dashboard under **Project Settings > API**:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-public-anon-key"
```

### 4. Apply Database Migrations
Go to your Supabase Project **SQL Editor** and paste the contents of `/supabase/migrations/20260629000000_init.sql`. Run the query to establish:
*   Standard Tables & Triggers
*   Row Level Security Policies
*   Transactional RPC Functions (`transfer_funds`)
*   Real-time publications

### 5. Launch local server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## ⚡ Supabase Setup & Google OAuth Integration

To integrate Google Sign-In, follow this configuration sequence:

### 1. Google Cloud Console Configuration
1.  Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project named `NexaBank Production`.
3.  Go to **APIs & Services > Credentials** and configure your **OAuth Consent Screen**.
4.  Create an **OAuth Client ID** credential:
    *   **Application Type**: Web Application.
    *   **Authorized Redirect URIs**: Paste your Supabase project redirect URI (retrieved from your Supabase dashboard under **Auth > Providers > Google**).

### 2. Supabase Provider Integration
1.  Navigate to your [Supabase Dashboard](https://supabase.com/).
2.  Go to **Auth > Providers > Google**.
3.  Enable the Google Provider.
4.  Paste your **Client ID** and **Client Secret** copied from the Google Cloud Console.
5.  Save the changes.

---

## 🚀 Deploying to Vercel

Vercel provides a native, optimized host environment for Vite applications.

### 1. Import Repository
1.  Login to [Vercel](https://vercel.com/).
2.  Click **Add New > Project** and import your NexaBank repository.

### 2. Build Settings Configuration
Vercel automatically detects Vite configurations, but verify the following settings:
*   **Framework Preset**: `Vite`
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`

### 3. Environment Variables Configuration
Under the **Environment Variables** section, add your production Supabase keys matching the variables in your local `.env`:
*   `VITE_SUPABASE_URL` = `https://your-production-id.supabase.co`
*   `VITE_SUPABASE_ANON_KEY` = `your-production-public-anon-key`

Click **Deploy**. Vercel will build and host your application in seconds.

---

## 📝 Pre-Flight Production Checklist

Before declaring the deployment "Fully Operational", check off the following quality verification items:

- [ ] **Linter Verification**: Run `npm run lint` and confirm zero syntax, TypeScript, or layout compiler warnings.
- [ ] **SSL Enforcement**: Confirm that both the Vercel app domain and the Supabase API endpoints are routed exclusively over HTTPS.
- [ ] **Realtime Sockets**: Confirm that WebSocket updates broadcast successfully during client updates (e.g. notifications).
- [ ] **Redirect Configuration**: Ensure Google Auth redirection leads successfully back to the production URL, not `localhost`.
- [ ] **No Development Credentials**: Confirm that no staging, local, or placeholder secrets are bundled into the compiled source.
- [ ] **Mobile Touch Precision**: Verify that elements are fluid and buttons are accessible on mobile screen formats.

---

## 🛠️ Common Troubleshooting Guide

### 1. Missing Environment Variables
*   **Symptom**: App builds, but the interface shows a "Supabase Connection Key Required" warning banner.
*   **Solution**: Ensure that your environment variable prefix maps to `VITE_SUPABASE_URL`. If using Vercel or other CI pipelines, double-check that the keys are configured as **Production** variables and not restricted to Preview or Development branches.

### 2. OAuth Authentication Redirect Failures
*   **Symptom**: Clicking "Sign In with Google" routes to an error screen stating "Redirect URI Mismatch".
*   **Solution**: Make sure the exact callback URL configured in your Google Cloud Credentials matches the redirect URI specified on your Supabase Authentication console.

### 3. Realtime updates are silent
*   **Symptom**: Deposits or transfers update the database tables, but the frontend requires a hard reload to see changes.
*   **Solution**: Check that PostgreSQL replication is active for tables. Go to your Supabase Project > Database > Replication and verify that the target tables (`wallets`, `transactions`, `notifications`, `deposits`, `withdrawals`) are selected for publication.

For more technical reference or styling specifications, check:
*   [NexaBank API Reference](./API.md)
*   [Design & CSS Style Guide](./STYLE_GUIDE.md)

---

**Author**: Luckman World
