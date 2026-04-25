# StudyMate AI

A modern, dark-themed React frontend for an AI study assistant. Upload syllabus PDFs, chat with them via RAG, and generate flashcards & quizzes.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + Shadcn-style UI components
- React Router DOM v6
- TanStack React Query
- Zustand (auth/onboarding state)
- React Hook Form + Zod
- Axios (with JWT interceptors)
- Framer Motion, Lucide, Sonner

## Quick Start

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if needed
npm run dev
```

Frontend runs at `http://localhost:5173`. Backend is expected at `http://localhost:8000/api` (override via `VITE_API_BASE_URL`).

## Backend

Connects to the StudyMate API documented in the project brief:
- `/auth/register/`, `/auth/login/`, `/auth/logout/`, `/auth/token/refresh/`
- `/profile/`, `/profile/extended/`
- `/syllabus/` (list / upload / get / delete)
- `/ai/chat/`

## Demo Login

Click **"Try Demo"** on the auth page — uses `demo / demo123`.

## Project Structure

```
src/
├── components/
│   ├── ui/          # Button, Card, Input, Tabs, etc.
│   ├── layout/      # Sidebar, TopBar, DashboardLayout, ProtectedRoute
│   └── chat/        # ChatModal
├── pages/           # Landing, Auth, Onboarding, Dashboard, Course, Flashcards, Settings, NotFound
├── services/        # api.ts (axios + endpoints)
├── store/           # authStore.ts (zustand)
├── types/           # shared TypeScript types
├── lib/             # utils
├── App.tsx
└── main.tsx
```

## Build

```bash
npm run build
npm run preview
```
