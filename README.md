# Purple Merit MERN Assessment

This project is a full-stack User Management System built using MERN.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT

## Features
- Secure login with bcrypt password hashing and JWT
- Role based access control: admin, manager, user
- Admin can create, update, deactivate users and assign roles
- Manager can list users and update non-admin users
- User can view and update own profile only
- Pagination + search + role/status filters in users list
- Audit fields: createdAt, updatedAt, createdBy, updatedBy
- User detail page shows audit info and creator/updater details

## Folder Structure
- `backend/` Express API
- `frontend/` React app

## Backend Setup
1. Go to backend folder:
   - `cd backend`
2. Install dependencies:
   - `npm install`
3. Create env file:
   - copy `.env.example` to `.env`
4. Run server:
   - `npm run dev`
5. Optional seed admin:
   - `npm run seed`

## Frontend Setup
1. Open new terminal:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Create env file:
   - copy `.env.example` to `.env`
4. Run frontend:
   - `npm run dev`

## Default URLs
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Main API Routes
- `POST /api/auth/login`
- `POST /api/auth/seed-admin-once` (public, one-time only, optional `SEED_ADMIN_KEY`)
- `POST /api/auth/register` (admin only)
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users` (admin, manager)
- `POST /api/users` (admin)
- `GET /api/users/:id`
- `PATCH /api/users/:id` (admin, manager)
- `DELETE /api/users/:id` (admin, soft delete to inactive)

Or use API once:
- `POST /api/auth/seed-admin-once` with `{ "name", "email", "password", "seedKey" }`
