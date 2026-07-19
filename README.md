# 📊 Vyntra — Sleek Personal Finance & Expense Tracker

Vyntra is a premium, secure, and modern personal finance tracker designed for individuals who want complete control over their money. It features a full multi-user authentication system (including Google Sign-In and Email OTP), interactive charting, comprehensive financial reports, and a dedicated, isolated Admin Panel for user management.

Developed with a clean dark-mode UI, glassmorphic card layouts, and responsive panels, Vyntra is ready to showcase in portfolio deployments.

---

## 🚀 Key Features

### 👤 User Application
- **Google OAuth & Password Sign-in**: Secure authentication using password hash encryption or modern Google accounts.
- **OTP Verification & Password Reset**: 6-digit email OTPs to verify new users and token-based reset links for forgotten passwords.
- **Enforced Password Complexity**: Strict safety rules requiring strong, secure password structures.
- **Interactive Financial Dashboard**: Total balance overview, dynamic income/expense summary, recent transactions, and accounts widgets.
- **Optimistic UI Updates**: Instant transaction feedback (under 50ms) across all summary tiles and categories.
- **Cache Persistence**: Offline/refresh persistence using TanStack React Query localStorage integration.
- **Multi-Account Management**: Create and track Cash, Bank, Wallet, Credit Card, and Investment accounts with real-time balance calculations.
- **Advanced Transactions**: Create income, expense, or transfer entries with categories (including "Other" quick-descriptive categories), source/destination accounts, tags, and references.
- **Interactive Circle Avatar Cropper**: Crop and pan profile pictures up to 4MB with canvas-based size optimization.
- **Visual Analytics**: Interactive breakdowns of spending categories and account distributions using beautiful Recharts visualizations.
- **Detailed Reports**: View income and expense statements, apply date ranges, and export statements directly to CSV.

### 🛡️ Isolated Admin Panel
- **Separate Authentication**: A completely separate admin login page (`/admin-login`) and database schema, using isolated session cookies.
- **Global Overview Stats**: Monitor active user count, overall transactions logged, total created accounts, and cumulative platform balance.
- **Auditing & Management**: Search and filter all registered users, toggle verification statuses, and view complete counts of accounts and transactions.
- **Financial Inspection**: Audit accounts and view complete transaction history lists for any selected user on the platform.
- **CRUD & Safety Operations**: Force-reset passwords or permanently delete users and their associated cascading data with confirmation guards.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Cache Sync**: TanStack Persist Query Client (localStorage caching)
- **Styling**: Tailwind CSS (modern color tokens, responsive glassmorphism)
- **State Management & Queries**: TanStack Query (React Query)
- **UI Elements & Icons**: React Icons, Framer Motion, React Hot Toast
- **Visualization**: Recharts

### Backend
- **Runtime & API**: Node.js, Express, TypeScript
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL (Supabase integration with optimized compound indexing)
- **Security**: JWT Session tokens, HTTP-Only secure cookies, bcrypt-hashed credentials
- **Email Delivery**: Resend SDK (transactional email templates)

---

## ⚙️ Project Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- PostgreSQL Database URL (e.g. Supabase connection string)
- [Resend](https://resend.com/) API Key (optional for development, fallback console-logging enabled)
- Google Cloud Console Project (for Google Login client keys)

### Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   DATABASE_URL="your_postgresql_database_url"
   DIRECT_URL="your_postgresql_direct_url"
   CORS_ORIGIN=http://localhost:5173
   SESSION_SECRET=your_jwt_secret_string
   
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # Email Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=onboarding@resend.dev
   
   # Admin Setup Credentials
   ADMIN_DEFAULT_EMAIL=admin@financeapp.local
   ADMIN_DEFAULT_PASSWORD=Admin@123!
   ```
3. Run database migrations:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. Access the application at `http://localhost:5173`.

---

## 🔒 Security Best Practices
- **Session Decoupling**: Admin sessions and User sessions are fully separated to prevent authorization leaks.
- **Dev-only OTP Fallback**: If email APIs are not configured or are in a sandbox limit, verification codes and links are printed directly to the backend CLI log for test verification.
- **Cascading Deletes**: User deletions safely clean up accounts, transactions, and configurations via PostgreSQL cascading rules.
