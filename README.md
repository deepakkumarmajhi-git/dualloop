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
    BE->>DB: Persist user & encrypt/store GitHub Access Token
    BE->>FE: Redirect back with local JWT token (?token=JWT)
    
    Note over FE: Client extracts JWT, writes to sessionStorage,<br/>and runs history.replaceState() to scrub URL bar
    
    FE->>BE: GET /repositories/sync (Authorization: Bearer JWT)
    Note over BE: JWT validated (jose/HS256). Extracts user_id
    BE->>FE: Return "syncing" (Instant Async Ack)
    
    Note over BE: Spawns Background Task to sync telemetry
    BE->>DB: Lookup GitHub Access Token for user_id
    BE->>GH: Query repos (Parallelised via asyncio.gather, max 70)
    BE->>GH: Fetch repo languages & pull request status
    BE->>GH: Sync commits (Checks commits_etag to fetch diffs only)
    BE->>DB: Cascading CRUD: Remove stale/archived repos & commits
    BE->>DB: Store synced records linked by strict foreign keys (owner_id)
    
    FE->>BE: GET /repositories/all (Bearer JWT)
    BE->>DB: Query repositories WHERE owner_id == current_user.id
    BE->>FE: Return isolated repository dashboard records
    FE->>Dev: Render Glassmorphic Telemetry Workspace
```

### Architecture Core Pillars

#### 1. OAuth 2.0 & Session Security
* **Double-Token Isolation**: DualLoop keeps the third-party token isolated. The frontend never sees or stores the raw GitHub access token. Instead, the backend exchanges the OAuth code, securely stores the GitHub Access Token in the database, and mints a short-lived **local JWT session token** signed with `HS256` and backed by a 7-day expiration duration.
* **Header and Fallback Extraction**: The FastAPI security module (`get_current_user`) extracts tokens primarily from standard `Authorization: Bearer <token>` request headers, with a secure query string fallback (`?token=...`) for compatibility.
* **Client-Side Sanitization**: Upon returning from the OAuth flow, the Next.js router immediately grabs the JWT from the URL search parameters, caches it in tab-isolated `sessionStorage` (preventing persistent leakage on shared machines), and immediately runs `window.history.replaceState` to strip the secret token from the browser address bar.

#### 2. Strict Multi-Tenant Isolation
* All backend routes query the DB exclusively with filter scopes tied to the active user's verification footprint:
  ```python
  repositories = db.query(Repository).filter(Repository.owner_id == current_user.id).all()
  ```
* Spoofing attempts, ID-guessing, or cross-tenant query injections are completely blocked because database access is bound strictly to the decoded JWT identity signature at the ORM layer.

#### 3. Optimized Asynchronous Ingestion & ETag Caching
* **Background Worker Processing**: Initiating a workspace refresh (`/repositories/sync`) triggers a non-blocking asynchronous FastAPI `BackgroundTask`, allowing the UI to remain incredibly responsive while heavy syncs run in the background.
* **GitHub Rate Limit Defenses**:
  * Parallelizes fetches using `asyncio.gather` for up to **70 active repositories** to keep sync times low without overwhelming GitHub APIs.
  * Deep commit detail analysis (additions, deletions, and extensions) is capped at the first **10 commits** to avoid triggering secondary abuse rate limits.
  * Employs **HTTP ETag caching** via `commits_etag` on the `repositories` table. If the repository hasn't changed on GitHub, it skips refetching the commit timeline.
* **Cascading Synchronisation (CRUD Sync)**: When repositories are deleted or archived on GitHub, the backend automatically performs a database sync to purge the stale records and cascades deletion to all associated commits.

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
