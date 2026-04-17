# StudyMate AI — Frontend

AI-powered study assistant for Indian college students. Built with React + TypeScript + Tailwind CSS + Framer Motion.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| State | Zustand (auth/global) |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| UI Components | Radix UI primitives (custom styled) |
| Notifications | Sonner |
| File Upload | React Dropzone |
| Fonts | Syne (display) + DM Sans (body) + JetBrains Mono |

## Pages

| Route | Page |
|-------|------|
| `/` | Landing Page |
| `/auth` | Login / Signup |
| `/onboarding` | 4-step onboarding wizard |
| `/dashboard` | Dashboard Overview |
| `/dashboard/courses` | Course list |
| `/dashboard/quizzes` | Quiz history |
| `/dashboard/progress` | Progress analytics |
| `/course/:id` | Course detail with accordion chapters |
| `/flashcards` | Flashcard decks + study mode |
| `/settings` | Profile, subscription, API keys |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

## Demo Login

Click **"Try Demo without signing up"** on the auth page, or use:
- Email: any email
- Password: any 6+ character password

## Connecting to Django Backend

Replace mock functions in `src/services/api.ts` with real fetch calls:

```typescript
// Example: Replace mockUser with real API
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    return res.json()
  },
}
```

## Folder Structure

```
src/
├── components/
│   ├── ui/          # Base UI components (Button, Card, Input, etc.)
│   ├── layout/      # Sidebar, TopBar, DashboardLayout, ProtectedRoute
│   ├── dashboard/   # CommandPalette
│   ├── chat/        # ChatModal (AI chat overlay)
│   └── ...
├── pages/           # All page components
├── services/        # API service layer (mock → real)
├── store/           # Zustand stores (auth)
├── types/           # TypeScript interfaces
└── lib/             # Utilities (cn, formatDate)
```

## Key Features Implemented

- ✅ Dark mode by default (CSS variables, fully themeable)
- ✅ Responsive sidebar with collapse animation
- ✅ Framer Motion page/element animations
- ✅ Command palette (Ctrl+K)
- ✅ AI Chat modal with typing indicator
- ✅ Flashcard flip animation + Study Mode (swipe-style)
- ✅ 4-step onboarding wizard with drag & drop PDF upload
- ✅ Protected routes with Zustand auth persistence
- ✅ Toast notifications (Sonner)
- ✅ Loading skeletons for all async content
- ✅ PWA manifest
- ✅ Course progress rings (custom SVG)
- ✅ 404 page
