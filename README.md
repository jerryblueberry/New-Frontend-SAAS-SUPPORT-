# Aecus Care

A comprehensive NDIS/healthcare workforce management platform connecting care workers with clients (individuals & organizations) through intelligent matching, robust onboarding, and administrative oversight.

---

## 🎯 Platform Overview

Aecus Care is a **talent pool/marketplace platform** for the Australian healthcare sector, specifically designed for NDIS (National Disability Insurance Scheme) support services.

### Business Model
- **Clients** (individuals or organizations) post jobs with specific requirements
- **Platform** matches qualified workers based on job criteria
- **Subscription/pay-per-job** revenue model for clients
- Platform does NOT handle client-to-worker payments (direct arrangement)

### Three User Roles
| Role | Description |
|------|-------------|
| **Care Workers** | Healthcare professionals seeking employment opportunities |
| **Clients** | Individuals receiving NDIS support OR organizations managing multiple clients |
| **Administrators** | Platform managers handling verification, compliance, and oversight |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | Core framework with fast dev server |
| Material UI (MUI) v7 | Primary UI components |
| Ant Design | Secondary components (tables, forms) |
| TailwindCSS v4 | Utility-first styling |
| Zustand | Global state management |
| React Query (TanStack) | Server state & caching |
| React Hook Form + Zod/Yup | Form validation |
| Framer Motion | Animations & transitions |
| Recharts | Data visualization (dashboards) |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (access + refresh tokens) | Authentication |
| Passport.js + Google OAuth | Social login |
| Cloudinary | File/image storage |
| Nodemailer + MJML | Email notifications |
| Winston | Structured logging |
| Helmet, HPP, Rate Limiting | Security middleware |
| Mindee + Tesseract.js | OCR for document verification |
| Zod + Joi | Request validation |

---

## ✨ Core MVP Features

### 👷 Worker Management

**Multi-Step Onboarding (5 Sections @ 20% each):**
1. **Basic Info** - Biography, hourly rate, languages, residency status
2. **Availability** - Weekly schedule, custom time slots, travel radius, suburb
3. **Certifications** - NDIS screening, police checks, first aid, visa documents with OCR verification
4. **Work History** - Employment history with CV upload
5. **Health Information** - Medical conditions, vaccinations, lifting ability, accommodations

**Key Features:**
- Profile completeness tracking (0-100%)
- Certificate expiry monitoring & status (Pending/Verified/Rejected/Expired)
- Dynamic certification validation based on residency status
- Reference check system with questionnaires sent to referees
- Other certifications (custom uploads)

### 👥 Client Management

**One-Step Minimal Onboarding:**
- Account type selection (individual vs organization)
- Basic info: address, emergency contact, organization details (if applicable)
- Auto-submission when basic info complete → status: `submitted`

**Client Types:**
| Type | Description | Preferences |
|------|-------------|-------------|
| **Individual** | Single person receiving NDIS support | Optional - can set defaults for job posting |
| **Organization** | Care provider managing multiple clients | No profile preferences - each job unique |

**Status Workflow:**
```
draft → submitted → verified → active
         ↓
      rejected → draft (resubmission)
```

**Enterprise Features:**
- Multi-user organization management (owner, manager, staff, viewer roles)
- Document verification with expiry tracking
- Subscription management (monthly/quarterly/yearly, pay-per-job)
- Change history & audit trail
- Admin notes system
- Soft delete with restore capability

### 📋 Job Posting System

**Job Structure:**
- Title, description, category, job type (full-time/part-time/casual/contract/one-time)
- Schedule with weekly patterns and recurrence
- Hourly rate range (min/max)
- Location with geospatial coordinates for proximity matching

**Support Details:**
- NDIS support categories (core_supports, capacity_building, capital_supports, etc.)
- Service regions
- Support level (low/medium/high/intensive)
- Special requirements

**Worker Criteria - Required:**
- Skills, certifications, experience level
- Language requirements with proficiency levels
- Physical requirements (lifting, standing, driving, vehicle)
- Background check requirements

**Worker Criteria - Preferred:**
- Gender, age group, personality traits
- Education level, experience areas

**Cultural Considerations:**
- Dietary requirements (vegetarian, halal, kosher, allergies, etc.)
- Religious observances and gender sensitivity
- Lifestyle preferences (habits, interests, values)

**Intelligent Matching Algorithm:**
```
Score = (Skills × 2) + (Regions × 1) + (Experience × 1.5) + 
        (Gender × 0.5) + (Location × 1) + (Background × 1) + (Vehicle × 0.5)
        ─────────────────────────────────────────────────────────────────────
                              Total Weight (7.5)
```

### ⏱️ Timesheets & Progress Notes

- Worker timesheet submission with approval workflow
- Progress note documentation for care delivery
- Audit trail for all changes
- Admin approval/rejection system

### 🔔 Notification System

- Real-time in-app notifications
- Email notifications (password reset, verification, reference checks)
- Read/unread status tracking
- Notification polling

### 🛡️ Admin Dashboard

**Analytics & Metrics:**
- Key metrics grid (workers, clients, jobs, revenue)
- Growth analytics with charts
- Status distribution visualization
- Reference analytics section
- System health monitoring

**Management Features:**
- Worker verification & certificate approval
- Client profile verification
- Reference tracking & questionnaire management
- Holiday management for availability
- Document verification workflows

### 🔐 Security & Authentication

**Authentication Flow:**
- JWT access tokens (short-lived)
- Refresh token rotation with family tracking
- Token revocation & device management
- Google OAuth integration
- OTP for password reset with attempt limiting

**Security Middleware:**
- Rate limiting per endpoint
- Request sanitization (mongo, XSS)
- Helmet security headers
- HPP (HTTP Parameter Pollution) protection
- IP anonymization for privacy compliance

---

## 📁 Project Structure

```
Aecus Care/
├── Backend/
│   ├── config/           # Database, passport, logging config
│   │   ├── db.js         # MongoDB connection
│   │   ├── passport.js   # Auth strategies
│   │   └── logger.js     # Winston logging setup
│   ├── controllers/      # Route handlers
│   │   ├── auth-controller.js
│   │   ├── admin-controller.js
│   │   ├── worker-profile-controller.js
│   │   └── client-controllers/  # Client profile management
│   ├── middlewares/      # Auth, validation, audit
│   │   ├── authMiddleware.js
│   │   └── zodValidate.js
│   ├── models/           # Mongoose schemas
│   │   ├── user-model.js
│   │   ├── worker-profile-model.js
│   │   ├── client-profile-model.js
│   │   ├── job-model.js
│   │   └── TimeSheet/, ProgressNote/, AuditLog/
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   ├── validators/       # Zod/Joi validation schemas
│   └── utils/            # Helper utilities
│
└── Frontend/
    └── src/
        ├── api/          # Axios API calls
        │   ├── auth.js
        │   ├── clientProfile.js
        │   └── notifications.js
        ├── components/   # Reusable UI components
        │   ├── AdminDashboard/
        │   ├── ClientComponents/
        │   ├── workerDashboard/
        │   └── WorkerCertificateOnboarding/
        ├── context/      # React context (Auth)
        ├── hooks/        # Custom React hooks
        │   ├── useAuth.js
        │   ├── useRefreshToken.js
        │   └── useNotifications.js
        ├── pages/        # Page components
        │   ├── AdminPages/
        │   ├── ClientPages/
        │   └── WorkerDasboardPages/
        ├── stores/       # Zustand state stores
        │   ├── useOnboardingStore.js
        │   └── clientStores/
        └── utils/        # Helper functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account (for file uploads)
- Google OAuth credentials (optional, for social login)

### Backend Setup
```bash
cd Backend
npm install

# Create .env file with:
# MONGODB_URI=your_connection_string
# JWT_SECRET=your_secret
# JWT_REFRESH_SECRET=your_refresh_secret
# CLOUDINARY_CLOUD_NAME=your_cloud
# CLOUDINARY_API_KEY=your_key
# CLOUDINARY_API_SECRET=your_secret
# EMAIL_USER=your_email
# EMAIL_PASS=your_app_password

npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:5000/api
# VITE_GOOGLE_CLIENT_ID=your_google_client_id

npm run dev
```

---

## 📡 API Modules

| Endpoint | Description |
|----------|-------------|
| `/api/auth` | Registration, login, password reset, token refresh, logout |
| `/api/admin` | Analytics, user management, verification workflows |
| `/api/worker-profile` | Worker profile CRUD, completeness tracking |
| `/api/worker-certifications` | Certificate management, verification status |
| `/api/worker-references` | Reference check system, questionnaires |
| `/api/client-profile` | Client profile CRUD, status management |
| `/api/jobs` | Job posting, applications, worker matching |
| `/api/timesheets` | Timesheet submissions, approvals |
| `/api/progress-notes` | Care progress documentation |
| `/api/notifications` | Notification management |
| `/api/holidays` | Holiday scheduling for availability |

---

## 🔄 Key Data Models

### User Model
- Email/password or Google OAuth
- Role-based access (worker, client, admin)
- Refresh token family tracking for security
- OTP with attempt limiting & account locking

### Worker Profile
- Linked to User (1:1)
- 5-section completeness calculation
- Dynamic certification validation
- Health information with conditional fields
- Work history and references

### Client Profile
- Individual or organization account types
- One-step onboarding (basic info = 100%)
- Preferences for individuals only (job defaults)
- Subscription & payment tracking
- Multi-user organization management

### Job Model
- Full job requirements specification
- Worker criteria (required vs preferred)
- Cultural considerations
- Intelligent matching with scoring algorithm
- Applicant tracking with match scores

---

## 📝 License

Proprietary - Aecus Care
