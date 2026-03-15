import './App.css'
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from './store/hooks/hooks'
import { autoRefresh } from './store/slices/userSlice'

import WelcomePage          from './pages/WelcomPage'
import LoginPage            from './pages/LoginPage'
import CreateAccountPage    from './pages/CreateAccountPage'
import { PrivacyPolicyPage, TermsOfServicePage } from './pages/LegalPage'
import DashboardPage        from './pages/Dashborard'
import ERQueuePage          from './pages/ERQueuePage'
import JoinQueuePage        from './pages/JoinQueuePage'
import ProfilePage          from './pages/ProfilePage'
import EmergencyWatchPage   from './pages/EmergencyWatchPage'
import HealthOnboardingPage from './pages/HealthOnboardingPage'
import AdminQueuePage       from './pages/AdminQueuePage'
import { RealtimeAudioPopup } from './components/RealtimeAudioPopup'

// ── Loading splash ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center juno-bg">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)' }}
        >
          <div className="w-6 h-6 bg-white rounded-full animate-ping opacity-75" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Loading JUNO…</p>
      </div>
    </div>
  )
}

// ── Route guards ───────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAppSelector(s => s.user)
  if (!isInitialized) return <LoadingScreen />
  if (!user)          return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAppSelector(s => s.user)
  if (!isInitialized) return <LoadingScreen />
  if (user)           return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useAppDispatch()

  // Attempt to silently refresh the access token on every cold load.
  // autoRefresh reads the stored refreshToken, exchanges it for a new
  // accessToken, and sets isInitialized=true when done (success or fail).
  useEffect(() => {
    dispatch(autoRefresh())
  }, [dispatch])

  return (
    <>
      <Routes>
        {/* Public — redirect to dashboard if already logged in */}
        <Route path="/"         element={<PublicRoute><WelcomePage /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><CreateAccountPage /></PublicRoute>} />
        <Route path="/terms"    element={<TermsOfServicePage />} />
        <Route path="/privacy"  element={<PrivacyPolicyPage />} />

        {/* Protected — redirect to /login if not authenticated */}
        <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/er-queue"        element={<ProtectedRoute><ERQueuePage /></ProtectedRoute>} />
        <Route path="/join-queue"      element={<ProtectedRoute><JoinQueuePage /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/emergency-watch" element={<ProtectedRoute><EmergencyWatchPage /></ProtectedRoute>} />
        <Route path="/health-setup"    element={<ProtectedRoute><HealthOnboardingPage /></ProtectedRoute>} />
        {/* <Route path="/medbot"          element={<ProtectedRoute><MedBotPage /></ProtectedRoute>} /> */}

        {/* Admin */}
        <Route path="/admin/queue/:departmentId" element={<ProtectedRoute><AdminQueuePage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <RealtimeAudioPopup />
    </>
  )
}

export default App
