import './App.css'
import { useEffect } from 'react'
import { Routes, Route, Navigate,  Outlet } from 'react-router-dom'
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
import MedBotPage from './pages/MedBotPage'

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
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAppSelector(s => s.user)
  if (!isInitialized) return <LoadingScreen />
  if (user)           return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// Wrap the entire protected section as a layout route
function ProtectedLayout() {
  const { user, isInitialized } = useAppSelector(s => s.user)
  if (!isInitialized) return <LoadingScreen />
  if (!user)          return <Navigate to="/login" replace />
  return <Outlet />   // renders the matched child route
}

function AdminLayout() {
  const { user, isInitialized } = useAppSelector(s => s.user)
  if (!isInitialized) return <LoadingScreen />
  if (!user || user.accountType !== "STAFF") return <Navigate to="/dashboard" replace />
  if (user.staffRole !== "ADMIN")            return <Navigate to="/dashboard" replace />
  return <Outlet />
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
        {/* Truly public — no redirect logic */}
        <Route path="/"       element={<WelcomePage />} />
        <Route path="/terms"  element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Redirect to dashboard if already logged in */}
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><CreateAccountPage /></PublicRoute>} />

        {/* Protected */}
        <Route element={<ProtectedLayout />}>
          <Route path="/medbot"         element = {<MedBotPage/>}/>
          <Route path="/dashboard"       element={<DashboardPage />} />
          <Route path="/er-queue"        element={<ERQueuePage />} />
          <Route path="/join-queue"      element={<JoinQueuePage />} />
          <Route path="/profile"         element={<ProfilePage />} />
          <Route path="/emergency-watch" element={<EmergencyWatchPage />} />
          <Route path="/health-setup"    element={<HealthOnboardingPage />} />

          <Route element={<AdminLayout />}>
            <Route path="/admin/queue/:departmentId" element={<AdminQueuePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <RealtimeAudioPopup />
    </>
  )
}

export default App
