# 🐝 TaskHive — Premium Task Marketplace

> A full-stack, production-ready task marketplace platform where users browse categories, purchase access packages, and unlock premium earning dashboards. Built with React + Node.js + PostgreSQL.

---

## 📁 Project Structure

```
taskhive/
├── frontend/          # React (Vite + Tailwind + Framer Motion)
└── backend/           # Node.js + Express + Prisma + PostgreSQL
```

---

## ⚡ Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 18, Vite, Tailwind CSS, Framer Motion     |
| State        | Zustand (auth), React Query (server state)      |
| Forms        | React Hook Form                                 |
| Backend      | Node.js, Express.js                             |
| Database     | PostgreSQL + Prisma ORM                         |
| Cache        | Redis (token storage, session management)       |
| Auth         | JWT access tokens + HTTP-only refresh cookies   |
| Payments     | Stripe, M-Pesa Daraja API                       |
| Email        | Nodemailer (Gmail SMTP)                         |
| Security     | Helmet, CORS, XSS-Clean, Rate Limiting, bcrypt  |
| Deployment   | Vercel (frontend), Railway (backend + DB)       |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- PostgreSQL (local or cloud)
- Redis (optional — falls back to in-memory)
- npm or yarn

---

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourname/taskhive.git
cd taskhive

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
# REQUIRED
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/taskhive"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_REFRESH_SECRET="another-secret-for-refresh-tokens"

# OPTIONAL (for full feature set)
REDIS_URL="redis://localhost:6379"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="you@gmail.com"
SMTP_PASS="your-gmail-app-password"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
MPESA_CONSUMER_KEY="..."
MPESA_CONSUMER_SECRET="..."
MPESA_PASSKEY="..."
CLIENT_URL="http://localhost:5173"
```

---

### 3. Set Up Database

```bash
cd backend

# Run Prisma migrations (creates all tables)
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed the database (admin user + categories + packages + tasks + phone numbers)
npm run db:seed
```

After seeding, you'll have:
- **Admin account:** `admin@taskhive.com` / `Admin@123!`
- 8 categories with 3 packages each (Starter $10 / Pro $25 / Unlimited $50)
- Sample tasks for each category
- 10 US phone numbers in inventory

---

### 4. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 5. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open: **http://localhost:5173**

---

## 🔐 Authentication Flow

```
Register → Email Verification → Login
         ↓
    JWT Access Token (15 min)
    + HTTP-only Refresh Cookie (7 days)
         ↓
    Auto-refresh on 401 (via axios interceptor)
```

**Access Control Levels:**
| Role  | Access                                                          |
|-------|------------------------------------------------------------------|
| Guest | Homepage, category previews, packages page (no tasks)           |
| User  | Dashboard, only categories they've purchased                    |
| Admin | Full admin panel, all data, analytics, user management          |

---

## 💳 Payment Flow

### Stripe
1. User selects package → POST `/api/payments/stripe/create-session`
2. Redirect to Stripe Checkout
3. Stripe fires webhook → POST `/api/payments/stripe/webhook`
4. Backend verifies signature → fulfills purchase → sends email

### M-Pesa (Daraja STK Push)
1. User enters phone → POST `/api/payments/mpesa/initiate`
2. STK push sent to user's phone
3. Safaricom fires callback → POST `/api/payments/mpesa/callback`
4. Backend verifies → fulfills purchase

**Test Stripe:** Use card `4242 4242 4242 4242`, any future expiry, any CVC.

---

## 📡 API Reference

### Auth
| Method | Endpoint                      | Auth     | Description             |
|--------|-------------------------------|----------|-------------------------|
| POST   | `/api/auth/register`          | Public   | Create account          |
| GET    | `/api/auth/verify-email/:token` | Public | Verify email            |
| POST   | `/api/auth/login`             | Public   | Login + get tokens      |
| POST   | `/api/auth/refresh`           | Cookie   | Refresh access token    |
| POST   | `/api/auth/logout`            | Bearer   | Invalidate tokens       |
| POST   | `/api/auth/forgot-password`   | Public   | Send reset email        |
| POST   | `/api/auth/reset-password/:t` | Public   | Reset password          |
| GET    | `/api/auth/me`                | Bearer   | Get current user        |

### Categories
| Method | Endpoint              | Auth   | Description       |
|--------|-----------------------|--------|-------------------|
| GET    | `/api/categories`     | Public | List all          |
| GET    | `/api/categories/:slug` | Public | Single + packages |

### Tasks (protected + purchase required)
| Method | Endpoint                           | Auth    | Description          |
|--------|------------------------------------|---------|----------------------|
| GET    | `/api/tasks/category/:categoryId`  | Bearer  | List tasks (paginated)|
| POST   | `/api/tasks/:taskId/submit`        | Bearer  | Submit task proof    |

### Payments
| Method | Endpoint                             | Auth   | Description          |
|--------|--------------------------------------|--------|----------------------|
| POST   | `/api/payments/stripe/create-session`| Bearer | Stripe checkout      |
| POST   | `/api/payments/stripe/webhook`       | None   | Stripe webhook       |
| POST   | `/api/payments/mpesa/initiate`       | Bearer | M-Pesa STK push      |
| POST   | `/api/payments/mpesa/callback`       | None   | Safaricom callback   |
| GET    | `/api/payments/my-payments`          | Bearer | Payment history      |

### Admin (admin role required)
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/api/admin/analytics`         | Full platform analytics  |
| GET    | `/api/admin/users`             | List users (paginated)   |
| PATCH  | `/api/admin/users/:id/status`  | Suspend/activate user    |
| DELETE | `/api/admin/users/:id`         | Delete user              |
| POST   | `/api/admin/tasks`             | Create task              |
| PUT    | `/api/admin/tasks/:id`         | Update task              |
| DELETE | `/api/admin/tasks/:id`         | Delete task              |
| POST   | `/api/admin/categories`        | Create category          |
| GET    | `/api/admin/payments`          | All payments             |
| POST   | `/api/admin/payments/:id/refund` | Issue refund           |
| GET    | `/api/admin/logs`              | Admin activity logs      |

---

## 🗄️ Database Schema Overview

```
User ──────────────── Purchase ──── Category ──── Package
 │                        │              │
 ├── Payment ◄────────────┘         Task ──── TaskSubmission ── User
 ├── PhoneSubscription ── PhoneNumber
 ├── Notification
 └── AdminLog
```

**Key models:** `User`, `Category`, `Package`, `Purchase`, `Payment`, `Task`, `TaskSubmission`, `PhoneNumber`, `PhoneSubscription`, `Notification`, `AdminLog`

---

## ☁️ Production Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Or connect your GitHub repo to Vercel
# Set environment variable: VITE_API_URL=https://your-api.railway.app/api
```

### Backend → Railway

1. Create new Railway project
2. Add PostgreSQL service (Railway provides DATABASE_URL automatically)
3. Add Redis service
4. Deploy backend from GitHub
5. Set all environment variables in Railway dashboard
6. The `railway.toml` runs migrations + seed on deploy

### Stripe Webhook (Production)

```bash
# Install Stripe CLI
stripe listen --forward-to https://your-api.railway.app/api/payments/stripe/webhook

# Or configure in Stripe Dashboard → Developers → Webhooks
# Event: checkout.session.completed
# URL: https://your-api.railway.app/api/payments/stripe/webhook
```

---

## 🛡️ Security Checklist

- [x] Helmet.js security headers
- [x] CORS locked to frontend origin
- [x] XSS-Clean on all inputs
- [x] Rate limiting (auth: 10/15min, payments: 20/hr, general: 100/15min)
- [x] bcrypt password hashing (12 rounds)
- [x] JWT access tokens (15 min TTL)
- [x] HTTP-only refresh cookies
- [x] Refresh token rotation (stored in Redis)
- [x] Stripe webhook signature verification
- [x] Prisma parameterized queries (SQL injection prevention)
- [x] Admin route role checking
- [x] Purchase verification before task access
- [x] Email enumeration prevention (forgot password)
- [x] Admin action logging

---

## 📦 Key Files Reference

```
backend/
├── src/index.js                    # Express app entry point
├── src/controllers/
│   ├── authController.js           # Register, login, JWT, email verify
│   ├── paymentController.js        # Stripe, M-Pesa, fulfillment logic
│   └── adminController.js          # Analytics, user/task/payment management
├── src/middleware/
│   ├── authMiddleware.js           # protect, requireAdmin, requirePurchase
│   ├── rateLimiter.js              # Auth, payment, general limiters
│   └── errorMiddleware.js          # Global error handler
├── src/routes/                     # All route definitions
├── src/services/emailService.js    # Nodemailer + HTML email templates
├── src/utils/jwt.js                # Token generation & verification
├── src/config/redis.js             # Redis client with in-memory fallback
└── prisma/
    ├── schema.prisma               # Full database schema (11 models)
    └── seed.js                     # Admin + categories + packages + tasks + phones

frontend/
├── src/App.jsx                     # Router + protected routes
├── src/store/authStore.js          # Zustand auth state with persistence
├── src/services/api.js             # Axios + auto-refresh interceptor
├── src/pages/
│   ├── HomePage.jsx                # Full public landing page
│   ├── PackagesPage.jsx            # Package selection + Stripe/M-Pesa checkout
│   ├── auth/                       # Login, Register, Forgot/Reset, Verify
│   ├── dashboard/                  # DashboardHome, Tasks, Earnings, Profile...
│   └── admin/                      # AdminDashboard, Users, Tasks, Payments...
└── src/components/layout/
    ├── DashboardLayout.jsx         # User sidebar + wallet balance
    └── AdminLayout.jsx             # Admin sidebar + shield badge
```

---

## 🐛 Common Issues

**Prisma client not found:**
```bash
cd backend && npx prisma generate
```

**Database connection failed:**
- Check `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- Ensure PostgreSQL is running

**Email not sending:**
- Use Gmail App Password (not account password)
- Enable 2FA in Gmail first, then generate App Password

**Stripe webhook 400:**
- Ensure raw body parsing for `/api/payments/stripe/webhook`
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

**M-Pesa STK push fails:**
- Use sandbox URL: `https://sandbox.safaricom.co.ke`
- Phone format must be `254XXXXXXXXX` (no +)

---

## 📄 License

MIT — Built for production. Customize freely.

---

*TaskHive — Built for earners, by earners. 🐝*
