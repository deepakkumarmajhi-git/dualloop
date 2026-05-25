# ♾️ DualLoop Workspace
### The Continuous Fullstack Developer Diagnostics & Repository Analytics Dashboard

DualLoop is a fullstack web application designed for developer workspaces. It connects to GitHub using secure OAuth 2.0 protocols to synchronize repository metrics, track commit logs, and compute isolated programming language analytics inside a dark-themed cybernetic dashboard.

---

## 🏗️ Architecture & Security Model

DualLoop is designed with an isolated, multi-tenant security architecture that guarantees developer data privacy. All repository telemetry, organization attributes, and commit timelines are strictly partitioned and accessible **only to the authenticated owner**.

### Dynamic System Flow

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant FE as Next.js Frontend
    participant BE as FastAPI Backend
    participant DB as SQLite / PostgreSQL
    participant GH as GitHub API

    Dev->>FE: Click "Continue with GitHub"
    FE->>BE: GET /auth/github/login
    Note over BE: Rate Limited (30/min via SlowAPI)
    BE->>GH: Redirect to GitHub OAuth Form
    GH->>BE: GET /auth/github/callback?code=XYZ
    Note over BE: Rate Limited (30/min via SlowAPI)
    BE->>GH: Exchange authorization code for GitHub Access Token
    Note over BE: Encrypts token with AES-256-GCM
    BE->>DB: Persist user & encrypted GitHub Access Token
    BE->>FE: Redirect to /dashboard with secure, HttpOnly cookie<br/>(dualloop_session_token=JWT)
    
    Note over FE: Client session runs securely.<br/>XSS cannot access HttpOnly cookie.
    
    FE->>BE: GET /repositories/sync (Session Cookie Attached)
    Note over BE: Extracts JWT from Cookie, Headers, or Query.<br/>Validates JWT (jose/HS256).
    BE->>FE: Return "syncing" (Instant Async Ack)
    
    Note over BE: Spawns Background Task to run unified sync
    BE->>DB: Lookup & decrypt GitHub Access Token (AES-256-GCM)
    BE->>GH: Fetch user profile (Bio, Followers, and Organizations)
    BE->>GH: Query repos (Parallelised via asyncio.gather, max 70)
    BE->>GH: Fetch repo languages & pull request status (open/merged)
    BE->>DB: Cascading CRUD: Purge deleted/archived repos & commits
    BE->>GH: Sync commits (Checks commits_etag for HTTP ETag caching)
    BE->>GH: Fetch commit details (Additions, deletions, extensions capped at 10)
    BE->>DB: Store records bound by strict foreign keys (owner_id)
    
    FE->>BE: GET /repositories/all (Session Cookie Attached)
    BE->>DB: Query repositories WHERE owner_id == current_user.id
    BE->>FE: Return isolated repository dashboard records
    FE->>Dev: Render Glassmorphic Telemetry Workspace
```

### Architecture Core Pillars

#### 1. AES-256-GCM & Session Cookie Security
* **AES-256-GCM Encryption at Rest**: To safeguard credentials, the raw GitHub Access Token is never stored as plain text in the database. Utilizing a hybrid ORM property, the token is automatically encrypted with AES-256-GCM using `AESGCM` (cryptography package) and a securely derived 32-byte `ENCRYPTION_KEY` upon database writes, and transparently decrypted on database queries.
* **HttpOnly Session Cookies**: Rather than exposing the JWT session token to browser storage and query strings, the backend callback issues a secure `HttpOnly`, `SameSite=Lax` session cookie called `dualloop_session_token` with a 7-day expiration lifespan.
* **Robust Multi-Channel Authentication**: The security utility `get_current_user` extracts authentication credentials with high versatility, checking the `dualloop_session_token` cookie first, with fallback parsing for standard `Authorization: Bearer <token>` headers and `?token=...` query parameters to facilitate developmental scripting.

#### 2. Strict Multi-Tenant Isolation
* All backend routes query the DB exclusively with filter scopes tied to the active user's verification footprint:
  ```python
  repositories = db.query(Repository).filter(Repository.owner_id == current_user.id).all()
  ```
* Spoofing attempts, ID-guessing, or cross-tenant query injections are completely blocked because database access is bound strictly to the decoded JWT identity signature at the ORM layer.

#### 3. Optimized Asynchronous Ingestion & ETag Caching
* **Unified Background Synchronisation**: Initiating a workspace refresh (`/repositories/sync`) triggers a non-blocking asynchronous FastAPI `BackgroundTask`. It queries and persists:
  * User profile details (Bio, Followers, and GitHub Organizations).
  * Up to **70 active repositories** processed in parallel.
  * Repository language allocations (calculating precise percentage weights) and pull request states (open vs. merged counts).
* **ETag Caching & Commit Caps**:
  * Employs **HTTP ETag caching** via `commits_etag` on the `repositories` table to avoid refetching unmodified commit timelines.
  * Caps deep commit metadata processing (lines added/deleted, extensions modified) at the first **10 commits** to completely defend against secondary abuse rate limit boundaries.
* **Cascading Synchronisation (CRUD Sync)**: If a repository is archived or deleted on GitHub, the backend cascading CRUD engine detects its absence, automatically purges the stale database records, and cascades deletion to all associated commits.

#### 4. API Infrastructure Protection
* **Rate-Limiting (DDoS Protection)**: Integrated `SlowAPI` with key auth-routes scoped to `30 requests per minute` per client IP to safeguard against brute-force account registration.
* **CORS Binding**: The server runs a locked CORS policy via `CORSMiddleware`, restricting traffic explicitly to the configured client-facing `FRONTEND_URL` and blocking untrusted cross-origin requests.
* **Dynamic Hot-Migrations**: DualLoop automatically applies non-breaking schema upgrades (e.g. database fields like `target_role`, `commits_etag`, `languages_json`, PR counts) during server startup, maintaining a zero-downtime development workflow.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4 (Turbopack).
* **Backend**: FastAPI (Python), Uvicorn, SQLAlchemy ORM, Jose (JWT), HTTPX.
* **Database**: Persistent SQLite (development fallback) & PostgreSQL (production-ready).

---

## ⚙️ Configuration & Secrets (`.env`)

Create a `.env` file inside the `backend/` directory to store your environment variables:

```bash
# backend/.env
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlite:///./dualloop.db
```

> [!TIP]
> **Database Auto-Config**: If `DATABASE_URL` is omitted, the application will automatically fall back to creating a local persistent SQLite database (`dualloop.db`) in the root directory.

---

## 🚀 Step-by-Step Installation & Running Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0 or higher)
* [Python](https://www.python.org/) (v3.10 or higher)
* A [GitHub OAuth App](https://github.com/settings/developers) registered with:
  * Homepage URL: `http://localhost:3000`
  * Authorization callback URL: `http://localhost:8000/auth/github/callback`

---

### Step 1: Run the Backend (Python)

Open a terminal in the root workspace directory:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (if not already created)
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Start the FastAPI development server
uvicorn app.main:app --reload
```

The backend server will start running on **`http://localhost:8000`**. On startup, the database engine will automatically run migrations and compile schemas in `dualloop.db`.

---

### Step 2: Run the Frontend (Next.js)

Open a second terminal in the root workspace directory:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Turbopack Next.js development server
npm run dev
```

The frontend development server will spin up on **`http://localhost:3000`**.

---

## 🌐 Putting this Project on GitHub

We have configured a root-level `.gitignore` file to ensure database files, secret environments, and compiled Node modules are **not checked in**. Follow these steps to commit and push this repository safely:

```bash
# 1. Initialize Git in the workspace root directory (f:\dualloop)
git init

# 2. Add all files (the .gitignore will protect your secrets automatically)
git add .

# 3. Create your first commit
git commit -m "feat: complete fullstack workspace dashboard with isolated oauth analytics"

# 4. Create a new repository on your GitHub account and copy its URI.
# 5. Link the remote repository and rename the default branch to 'main'
git remote add origin https://github.com/your-username/dualloop.git
git branch -M main

# 6. Push the project to GitHub!
git push -u origin main
```

---

## 💎 Features Implemented & Optimized

* **Next.js Prerendering Fix**: Client Hooks (`useSearchParams`) are isolated inside a React `<Suspense>` boundary to guarantee a flawless production compile (`npm run build`).
* **Multi-tenant Analytics Security**: Restructured the analytics queries to decode incoming JWT identities, isolating metrics strictly on a per-user basis.
* **Full SQLite Database Fallback**: Out-of-the-box local testing capabilities without needing a PostgreSQL server daemon.
* **Type-Safe API Contracts**: Built strict, aligned interfaces between FastAPIs and client-side states to prevent browser render crashes.
