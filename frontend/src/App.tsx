import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";
import { FlashcardsPage } from "@/pages/FlashcardsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/courses" element={<DashboardPage />} />
        <Route
          path="/dashboard/quizzes"
          element={
            <Placeholder title="Quizzes" subtitle="Practice quizzes are coming soon." />
          }
        />
        <Route
          path="/dashboard/progress"
          element={
            <Placeholder title="Progress" subtitle="Detailed analytics are coming soon." />
          }
        />
        <Route path="/course/:id" element={<CourseDetailPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <h1 className="font-display text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
