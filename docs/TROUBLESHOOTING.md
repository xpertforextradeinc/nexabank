# NexaBank Troubleshooting Guide

This document lists common runtime issues, database configuration mismatches, build-time compilation snags, and their step-by-step resolutions.

---

## ⚡ Supabase Configuration Warnings

### 1. "Supabase Configuration Key Required" warning banner
*   **Symptom**: The landing page displays a prominent warning block prompting you to add configuration keys.
*   **Cause**: The application cannot detect valid Supabase environment variables on client initialization, causing the client library to fall back to dummy credentials to prevent compilation failure.
*   **Resolution**:
    1.  Ensure you have created a `.env` file in the root of your project:
        ```bash
        cp .env.example .env
        ```
    2.  Fill in the keys with your project credentials:
        ```env
        VITE_SUPABASE_URL="https://your-project-id.supabase.co"
        VITE_SUPABASE_ANON_KEY="your-public-anon-key"
        ```
    3.  Restart your local development server:
        ```bash
        npm run dev
        ```
    4.  If deploying to Vercel, ensure these environment variables are set in your Vercel Project Dashboard.

---

## 🔑 Google OAuth & Login Issues

### 1. "Redirect URI Mismatch" when clicking "Sign In with Google"
*   **Symptom**: Google Auth returns an error screen with standard mismatch codes.
*   **Cause**: The callback URL registered on your Google Cloud Console does not match your active Supabase environment configuration.
*   **Resolution**:
    1.  Go to your **Supabase Dashboard > Auth > Providers > Google**.
    2.  Locate the auto-generated **Redirect URL** (e.g., `https://your-project.supabase.co/auth/v1/callback`).
    3.  Go to your **Google Cloud Console > APIs & Services > Credentials**.
    4.  Select your OAuth Client ID and add that exact URL under **Authorized redirect URIs**.
    5.  Save changes. Allow up to 5 minutes for Google's DNS to update.

### 2. User creates an account but cannot log in
*   **Symptom**: "Email address not verified" error upon login attempt.
*   **Cause**: Supabase project has email confirmation enabled, requiring user authentication verification.
*   **Resolution**:
    *   **Option A**: Check the mailbox of the registered address and confirm the registration link.
    *   **Option B (Recommended for demo environments)**: Navigate to your **Supabase Dashboard > Auth > Providers > Email**, and disable the **Confirm email** toggle. This allows instant user verification upon sign-up.

---

## 🚀 Vercel Deployment & Build Failures

### 1. "tsc --noEmit" fails during build phase
*   **Symptom**: The Vercel deployment pipeline fails during compilation with TypeScript type errors.
*   **Cause**: A code file contains strict type checks that are invalid (e.g., using `any` properties or invalid properties on global objects).
*   **Resolution**:
    1.  Run the linter locally to isolate the files causing errors:
        ```bash
        npm run lint
        ```
    2.  Ensure you are using named imports for types and avoiding standard TypeScript bypass patterns.
    3.  Verify that custom typings for global objects (like `ImportMeta`) are properly declared inside a `declare global` block (as done in `src/lib/supabase.ts`).

### 2. White screen on Vercel deployment
*   **Symptom**: The deployed URL loads with status 200, but renders a completely blank white screen.
*   **Cause**: A runtime exception occurred during initial JS asset execution, causing the React rendering tree to crash.
*   **Resolution**:
    1.  Open your browser console (**F12 > Console**) and examine the logs.
    2.  If the error lists `Failed to load resource: net::ERR_ABORTED 404`, check your Vite routing base path in `vite.config.ts`.
    3.  Verify that your database schema contains all necessary tables, as a missing table will crash the dashboard loading state. Paste `/supabase/migrations/20260629000000_init.sql` directly into your Supabase SQL editor and execute.

---

## 🔄 Session Persistence & Routing Errors

### 1. Page Refresh logs the user out
*   **Symptom**: Refreshing the browser on the dashboard routes the user back to the login screen.
*   **Cause**: The application is rendering the auth check before Supabase recovers the persistent session token from local storage.
*   **Resolution**:
    1.  Ensure you are monitoring the `loading` state from Supabase session checks:
        ```typescript
        const [loading, setLoading] = useState(true);
        ```
    2.  Do not render routing pages until the initial session check returns `false` (meaning the session has either successfully loaded or is confirmed null).

For architectural outlines or style system details, check:
*   [Architecture Blueprint](./ARCHITECTURE.md)
*   [Design & Style Guide](./STYLE_GUIDE.md)

---

**Author**: Luckman World
