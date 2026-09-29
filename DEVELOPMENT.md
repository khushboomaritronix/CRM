# CRM_V3 — Development Guide

This repo has two apps: `crm_backend/` (Django REST API) and `crm_frontend/` (React + Redux). Each has its own README with a quick-reference; this guide walks through the full local setup end to end, the gotchas you'll actually hit, and how to point the app at the QAT environment.

## Prerequisites

- Python 3.10+ (this repo was verified against 3.13)
- PostgreSQL 14+, running locally
- Node.js 18+ / npm
- Redis (optional for local dev — development settings use Django's in-memory cache instead, so you don't need Redis running just to develop)

## 1. Backend setup

```bash
cd crm_backend
pip install -r requirements.txt
```

Create the local database:

```sql
CREATE DATABASE crm_v3;
```

Copy the env template and fill in your local DB credentials:

```bash
cp .env.example .env
```

Run migrations and seed baseline data (modules, permissions, an Administrator role, a superuser):

```bash
python manage.py migrate
python manage.py seed
```

Start the server:

```bash
python manage.py runserver
```

API is now at `http://127.0.0.1:8000/api/`, Swagger docs at `http://127.0.0.1:8000/api/docs/`.

### How settings selection actually works

`manage.py` defaults to `config.settings.development` if `DJANGO_SETTINGS_MODULE` isn't already set as a real OS environment variable — so plain `python manage.py runserver` gives you `DEBUG=True`, a local Postgres connection, console email, and the Django Debug Toolbar, with no extra flags needed.

**Important**: the `DJANGO_SETTINGS_MODULE` line inside `.env` does *not* control this. `.env` is only read from *inside* `config/settings/base.py`, which is itself only imported once Django has already picked a settings module — by then it's too late for that line to change anything. If you need a different settings module (e.g. `config.settings.production` for QAT — see below), you must set `DJANGO_SETTINGS_MODULE` as an actual shell/process environment variable before `manage.py` runs, not just edit `.env`.

### Superadmin login

If `python manage.py seed` doesn't create an account you can log in with (or you've forgotten the password on an existing dev DB), reset one directly:

```bash
python manage.py shell -c "
from apps.users.models import User
u = User.objects.get(email='your.email@example.com')
u.set_password('NewPassword123')
u.is_active = True
u.save()
"
```

### Common gotchas already fixed in this repo (context, not action items)

- `requirements.txt` used to have a broken pin (`python-environ`, a nonexistent package) that blocked `pip install` entirely. Already removed — if you see it come back after a merge, delete it; the real package in use is `django-environ`.
- `django-debug-toolbar` needs both `INSTALLED_APPS`/`MIDDLEWARE` *and* a URL include (`config/urls.py`) — both are already wired for `DEBUG=True`.
- If you ever see `relation "..." does not exist` or `column "..." does not exist` on a model that clearly exists in code, it means a migration is missing — run `python manage.py makemigrations --check --dry-run` to check across every app, then `makemigrations`/`migrate` as needed. This has happened before in this repo (RFQResponse, OrderReturn.currency) from models being edited without generating migrations.

### Outbound email (Microsoft Graph + Celery)

App emails — new account credentials, password-changed confirmations, and internal RFQ notifications (new RFQ / status change) — are sent via Microsoft Graph (`apps/notifications/graph_email.py`), queued on Celery (`apps/notifications/tasks.py`) with automatic retry, and logged to the `EmailLog` model (visible in Django admin at `/admin/`) regardless of outcome.

To actually send anything, three things need to be true at once:

1. **Graph credentials** in `.env`: `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` — an Azure AD app registration with **Mail.Send application permission** (admin-consented), scoped to the mailbox named in `DEFAULT_FROM_EMAIL`. That mailbox must be a real Microsoft 365/Outlook mailbox — Graph's `sendMail` doesn't work against a Gmail address.
2. **Redis running** (`CELERY_BROKER_URL`/`CELERY_RESULT_BACKEND`, default `redis://localhost:6379/0`).
3. **A Celery worker running**, separate from `python manage.py runserver`:
   ```bash
   cd crm_backend
   celery -A config worker --loglevel=info    # Linux/macOS
   celery -A config worker --loglevel=info --pool=solo   # Windows
   ```

If any of these is missing, emails fail gracefully — `send_email_via_graph()` never raises, just returns `False`, retries up to 3 times (30s apart), and records the failure in `EmailLog`. Nothing about the rest of the app breaks; you just won't see an email land. This is also true if you skip Graph configuration entirely — email-sending is a fire-and-forget side effect (`_dispatch_email()`/`.delay()`), never something a request waits on.

**Who receives RFQ notifications**: superusers always; plus anyone whose Role is registered as a `NotificationRole` (Django admin → Notifications → Notification roles — links a `Role` to "receives RFQ emails").

## 2. Frontend setup

```bash
cd crm_frontend
npm install
npm start
```

Runs at `http://localhost:3000`, reading the backend URL from `.env`'s `REACT_APP_API_URL` (defaults to `http://localhost:8000/api` for local dev).

CRA automatically swaps in `.env.production` instead of `.env` when you run `npm run build` — see the QAT section below.

## 3. Day-to-day workflow

1. Start the backend (`python manage.py runserver`) and frontend (`npm start`) in separate terminals — both need to be running.
2. Log in at `http://localhost:3000/login`.
3. Backend model changes → always run `python manage.py makemigrations` and commit the generated migration file in the same change. Forgetting this is the single most common way to break the app for everyone else (see gotchas above).
4. RBAC: permissions are role-based (`Role` × `Module` × `Permission`), managed under Settings → Roles. A logged-in user's permission set is cached and refetched on page load — after changing someone's role/permissions, they need to refresh the page (not a full re-login) to see the change take effect.
5. Icons: the frontend uses `@mui/icons-material` throughout (migrated off `lucide-react`). Import icons individually, e.g. `import Delete from "@mui/icons-material/Delete";`, not as named imports from the package root.

## 4. Deploying to QAT (mtxcrm-qat.maritronix.in)

The QAT environment should run the same hardened settings as production — there's no separate "QAT" settings module, it just uses `config.settings.production` with QAT's own `.env`.

**Backend**, on the QAT server:

```bash
cp .env.qat.example .env
# fill in the real SECRET_KEY, DB credentials, email credentials
export DJANGO_SETTINGS_MODULE=config.settings.production   # must be a real env var, not just in .env — see above
python manage.py migrate
python manage.py collectstatic --noinput
# run via gunicorn/uwsgi + your process manager, not `runserver`
```

`config.settings.production` reads `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` from the environment — `.env.qat.example` already has these pre-filled for `mtxcrm-qat.maritronix.in`.

**Frontend**, when building for QAT:

```bash
cd crm_frontend
npm run build
```

This automatically picks up `.env.production` (already committed, pointing `REACT_APP_API_URL` at `https://mtxcrm-qat.maritronix.in/api`), producing a static build to deploy behind whatever serves that domain.

### Fixed while wiring this up

- `django-redis` (the actual cache backend class `config.settings.production` needs) was missing from `requirements.txt` — only the base `redis` client was listed. This would have crashed the app on startup under `config.settings.production`. Added.
- The production logging config pointed `RotatingFileHandler` at a relative `logs/django.log` path with nothing creating that directory — Python doesn't auto-create it, so this also crashed on startup on a fresh deploy. `production.py` now creates `logs/` itself and uses an absolute path.
- `CSRF_TRUSTED_ORIGINS` wasn't configured at all (needed by Django 4+ for the admin login form to work cross-origin over HTTPS). Added, reading from the environment.

### Known pre-existing issue — not fixed, needs your decision

`crm_backend/.env` and `crm_frontend/.env` are both committed to git with real secrets (`SECRET_KEY`, DB password, email password) despite `.gitignore` now listing `.env` — the ignore rule only stops *new* changes from being tracked, it doesn't retroactively untrack a file that's already committed, and does nothing about the secrets sitting in git history. Recommend at minimum running `git rm --cached crm_backend/.env crm_frontend/.env` (keeps the files on disk, stops future commits from touching them) and rotating the exposed credentials; fully scrubbing them from git history is a separate, more disruptive operation (rewrites history, needs a coordinated force-push) that I haven't done without your go-ahead.
