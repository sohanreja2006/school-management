# School Management System (multi-tenant SaaS)

A school operations web app: **React (Vite) + Tailwind** frontend, **Express** API, **Supabase** for tenants (schools/users) and most operational data in Postgres, **MongoDB** optional for some Mongoose models (for example payment verification), and **JWT** sessions.

## Tech stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide, i18next
- **Backend**: Node.js, Express, Helmet, rate limiting, JWT, Supabase JS, Mongoose (optional)
- **Identity / tenancy**: Supabase tables `schools`, `users`, `students`, etc., with `school_id` scoping on API routes

## Features (high level)

- **Dashboard**: statistics and charts
- **Auth**: JWT login for admin/teacher; parent portal (email + parent key); self-serve **school registration** creates a new school + admin user
- **Students, attendance, fees, reports**, timetable, exams/marks, admissions, homework, leaves, library, transport, payroll, inventory, events, behavior, notifications

## Local development

### Backend

1. `cd backend`
2. `npm install`
3. Copy `backend/.env.example` to `backend/.env` and set at least:
   - `JWT_SECRET` (32+ characters recommended)
   - `SUPABASE_URL` and `SUPABASE_KEY` (service role or anon key per your RLS strategy)
   - `MONGO_URI` if you use Mongo-backed routes
4. For **local** API + Vite, you can omit `ALLOWED_ORIGINS` to allow any origin, or set e.g. `ALLOWED_ORIGINS=http://localhost:5173`
5. `npm run dev`

### Frontend

1. `cd frontend`
2. `npm install`
3. Optional: set `VITE_API_URL` (defaults to `http://localhost:5000/api`)
4. `npm run dev`

## Production (SaaS) checklist

With `NODE_ENV=production`, the API **refuses to start** unless these are set:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signing key; **minimum 32 characters** |
| `SUPABASE_URL`, `SUPABASE_KEY` | Tenant and school data |
| `ALLOWED_ORIGINS` | Comma-separated browser origins (e.g. `https://app.yoursaas.com`) |

Other behavior in production:

- **No mock student/fee data** when Supabase is missing (returns **503**).
- **Helmet** security headers, **rate limits** on auth routes, **strict CORS** against `ALLOWED_ORIGINS`.
- **Passwords**: new registrations use **bcrypt**; legacy plain-text passwords in `users` still work until first successful login, then the API **re-hashes** them.
- **JWT payload** includes `email` so staff tokens resolve correctly to Supabase users.
- **Parent debug login** (`debug@test.com` / `123456`) is **disabled** in production.

Set `MONGO_URI` if you rely on Mongoose features (fee verification, etc.).

## Default credentials

If you seed a user in Supabase with a known password, use that account. The API no longer documents a shared default password for production.

## Project structure

- `backend/`: Express app, `config/` (JWT, startup validation, DB), `middleware/`, `routes/`, `controllers/`, `models/`
- `frontend/`: React app, pages, services, context
