<h1 align="center">
  <img src="https://img.shields.io/badge/HireFlip-AI-7c3aed?style=for-the-badge&logo=lightning&logoColor=white" alt="HireFlip AI" />
</h1>

<p align="center">
  <strong>AI-Powered Recruitment Fairness Auditor</strong><br/>
  Eliminate unconscious bias from your hiring pipeline with real-time fairness analytics, Gemini-powered candidate insights, and provable blind hiring workflows.
</p>

<p align="center">
  <a href="https://hireflip-ai.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-hireflip--ai.vercel.app-7c3aed?style=flat-square&logo=vercel" />
  </a>
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat-square&logo=supabase" />
</p>

---

## What is HireFlip?

HireFlip is an **AI-powered recruitment integrity platform** that gives HR teams and hiring managers a transparent, bias-aware view of their candidate evaluation pipeline.

Traditional ATS tools are black boxes. HireFlip flips the script — it ingests your existing candidate CSV data, runs it through a fairness engine, surfaces demographic parity metrics, and lets you audit every shortlisting decision with full explainability, powered by Google Gemini.

It is designed around three core principles:

| Principle | What it means |
|---|---|
| **Truthfulness** | Every metric reflects your actual uploaded data — no mock or sample values |
| **Privacy-First** | Resume Anonymizer masks PII before evaluation; raw data is never used for ranking |
| **Explainability** | Every candidate decision is backed by a structured AI-generated rationale |

---

## Features

### 📊 Fairness Analytics Dashboard
- Real-time fairness score, demographic parity, and equalized odds metrics
- Candidate funnel breakdown (Shortlisted / In Review / Rejected)
- Gender and group influence scoring per candidate

### 🔍 Candidate Management
- Upload any recruiter CSV — columns are dynamically detected
- Smart scoring engine with fairness-adjusted ranking
- Manual override: approve or reject AI recommendations with one click
- Persistent per-user decisions scoped by account

### 🛡️ Dynamic Resume Anonymizer
- Detects PII fields (`name`, `gender`, `caste`, `religion`, `dob`, etc.) from your actual CSV columns
- Blind Hiring mode: masks sensitive fields in the UI while keeping raw values for accurate metrics
- PII Masking Preview shows exact "Protected" vs "Preserved" field breakdown before upload
- Anonymization preference stored per dataset — truthful, not performative

### 🤖 Gemini AI Candidate Explainability
- Per-candidate "AI Hiring Insight" section in candidate detail modal
- Explains strengths, hiring fit, concerns, and status rationale
- Client-side caching to avoid quota abuse on free tier
- Graceful fallback to deterministic local explanation if API is unavailable

### 📋 Recruitment Integrity Audit Report
- Printable PDF-style audit report with fairness index, risk profile, and demographic parity
- Dynamic Responsible AI section listing exactly which PII fields were masked
- Chronological audit trail of all manual recruiter interventions
- Governance and methodology certification block

### 👤 Multi-User Account Isolation
- Every user has a completely private workspace
- All localStorage keys are scoped by `user_id` to prevent cross-account data leakage
- Logout clears only the active user's session state

---

## Architecture

```
HireFlip-Ai/
├── frontend/                    # Next.js 15 App Router
│   ├── app/
│   │   ├── page.js              # Marketing landing page
│   │   ├── dashboard/           # Main recruiter dashboard
│   │   ├── candidates/          # Candidate list view
│   │   ├── reports/             # Audit report generation
│   │   ├── login/               # Authentication
│   │   └── signup/
│   ├── components/
│   │   └── dashboard/
│   │       ├── candidate-table.jsx       # Main candidate list + decisions
│   │       ├── explanation-modal.jsx     # Candidate detail + Gemini AI insight
│   │       ├── blind-hiring-status.jsx   # Dynamic anonymization status card
│   │       ├── metrics-cards.jsx         # Fairness score cards
│   │       ├── upload-section.jsx        # CSV upload + PII masking preview
│   │       └── sidebar.jsx
│   └── hooks/
│       └── use-candidate-decisions.js    # Per-user decision state manager
│
└── backend/                     # FastAPI
    ├── main.py                  # App entrypoint, CORS, route registration
    ├── auth.py                  # JWT auth, password hashing
    ├── database.py              # SQLAlchemy + Supabase PostgreSQL connection
    ├── models/
    │   ├── user.py              # User ORM model
    │   ├── dataset.py           # Dataset ORM model (with is_anonymized flag)
    │   └── schemas.py           # Pydantic request/response schemas
    ├── routes/
    │   ├── auth.py              # /auth/login, /auth/register, /auth/me
    │   ├── upload.py            # /upload-csv + get_current_dataset dependency
    │   ├── candidates.py        # /candidates (with on-the-fly blind mode masking)
    │   ├── metrics.py           # /metrics (fairness scores, demographic parity)
    │   ├── shortlist.py         # /shortlist (original vs adjusted comparison)
    │   ├── reports.py           # /report
    │   └── ai.py                # /ai/explain-candidate (Gemini integration)
    └── services/
        ├── fairness_engine.py   # Core bias detection and scoring engine
        ├── shortlist.py         # Fairness-adjusted ranking algorithm
        └── csv_parser.py        # Dynamic column detection and normalization
```

### Data Flow

```
Recruiter uploads CSV
        │
        ▼
┌───────────────────┐
│   CSV Parser      │  Detects columns, normalizes fields
│  (csv_parser.py)  │  Validates schema (name, experience, etc.)
└────────┬──────────┘
         │  Raw CSV bytes stored in PostgreSQL
         │  is_anonymized flag stored per dataset
         ▼
┌───────────────────┐
│  Fairness Engine  │  Calculates scores using RAW data
│ (fairness_engine) │  Demographic parity, equalized odds
│                   │  Fairness-adjusted ranking
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  /candidates API  │  If is_anonymized=True:
│                   │  → Name → "Candidate #N"
│                   │  → Gender/Caste → "[REDACTED]"
│                   │  Metrics always use raw values
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Next.js Frontend │  Dynamic column detection
│                   │  Shows only real PII fields
│                   │  Blind Hiring status + modal masking
│                   │  Gemini AI explainability
└───────────────────┘
```

**Key architectural decision:** Anonymization is a *display-layer concern only*. The fairness engine always operates on raw demographic data to produce statistically valid metrics. The frontend receives masked values for the recruiter UI, but backend metrics are always computed from the source truth.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React, Framer Motion, Lucide Icons, Vanilla CSS |
| **Backend** | FastAPI, SQLAlchemy, Pydantic v2 |
| **Database** | PostgreSQL via Supabase |
| **AI** | Google Gemini API (`google-generativeai`) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **CSV Processing** | Pandas, PapaParse (client-side preview) |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database (or Supabase project)
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run database migrations (adds missing columns safely)
python scratch/migrate_db.py

# Start the server
uvicorn main:app --reload
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

**`.env` variables:**
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
# App available at http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Create new account |
| `POST` | `/auth/login` | ❌ | Login, returns JWT token |
| `GET` | `/auth/me` | ✅ | Get current user profile |
| `PUT` | `/auth/profile` | ✅ | Update profile |
| `POST` | `/upload-csv` | ✅ | Upload candidate CSV + anonymize flag |
| `GET` | `/candidates` | ✅ | Get processed candidates (with blind mode) |
| `GET` | `/metrics` | ✅ | Get fairness metrics and demographic parity |
| `GET` | `/shortlist` | ✅ | Original vs fairness-adjusted shortlist comparison |
| `GET` | `/report` | ✅ | Generate audit report data |
| `POST` | `/ai/explain-candidate` | ✅ | Gemini AI explanation for a candidate |
| `GET` | `/health` | ❌ | Health check |

All authenticated routes require `Authorization: Bearer <token>` header.

---

## CSV Format

HireFlip works with any recruiter CSV. Required columns:

| Column | Required | Description |
|---|---|---|
| `name` | ✅ | Candidate full name |
| `experience` | ✅ | Years of experience (numeric) |
| `qualification` | ✅ | Highest qualification |
| `gender` | ✅ | Used for demographic parity calculation |

Optional columns that are automatically detected and handled:

`caste`, `religion`, `email`, `phone`, `salary_expectation`, `college`, `university`, `dob`, `age`, `skills`, `ethnicity`

Any sensitive field detected is reported in the Blind Hiring status card and masked when anonymization is active.

---

## Deployment

### Render (Backend)
1. Connect your GitHub repo to Render
2. Set **Build Command**: `pip install -r requirements.txt`
3. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all `.env` variables in the Render Environment settings

### Vercel (Frontend)
1. Connect your GitHub repo to Vercel
2. Set **Root Directory**: `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## Security

- **JWT Authentication**: All data routes require a valid bearer token. Token expiry is configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Per-User Data Isolation**: Datasets are stored per `user_id` in the database. No user can access another user's uploaded data.
- **Client-Side Storage Scoping**: All `localStorage` keys (decisions, AI cache, notes) are namespaced by `user_id` to prevent cross-account leakage in shared browser environments.
- **Privacy-First Anonymization**: The raw CSV is stored securely in the database. The `is_anonymized` flag controls display masking only — the fairness engine always reads raw values, never masked proxies.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ to make hiring fairer, one audit at a time.
</p>
