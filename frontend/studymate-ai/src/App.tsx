import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardOverview } from './pages/DashboardOverview'
import { FlashcardsPage } from './pages/FlashcardsPage'
import { CourseDetail } from './pages/CourseDetail'
import { SettingsPage } from './pages/SettingsPage'
import { CoursesPage, QuizzesPage, ProgressPage } from './pages/DashboardPages'
import { NotFoundPage } from './pages/NotFoundPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } }
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected - Dashboard layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="quizzes" element={<QuizzesPage />} />
            <Route path="progress" element={<ProgressPage />} />
          </Route>

          {/* Protected - standalone pages */}
          <Route path="/course/:id" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CourseDetail />} />
          </Route>

          <Route path="/flashcards" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<FlashcardsPage />} />
          </Route>

          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: { background: 'hsl(240 8% 7%)', border: '1px solid hsl(240 6% 15%)', color: 'hsl(220 15% 95%)' }
        }}
      />
    </QueryClientProvider>
  )
}
