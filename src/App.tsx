import './App.css'
import LoginPage from './pages/LoginPage'
import CreateAccountPage from './pages/CreateAccountPage'
import { Routes, Route} from 'react-router-dom'
import DashboardPage from './pages/Dashborard'
import ERQueuePage from './pages/ERQueuePage'
import JoinQueuePage from './pages/JoinQueuePage'
import { RealtimeAudioPopup } from './components/RealtimeAudioPopup'
import AdminQueuePage from './pages/AdminQueuePage'
import ProfilePage from './pages/ProfilePage'
import EmergencyWatchPage from './pages/EmergencyWatchPage'
import HealthOnboardingPage from './pages/HealthOnboardingPage'
import WelcomePage from './pages/WelcomPage'
function App() {

  return (
    <>
      <Routes>
       <Route path="/" element={<WelcomePage />} />
       <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<CreateAccountPage />} />
       <Route path="/dashboard" element={<DashboardPage />} />
       <Route path="/er-queue" element={<ERQueuePage />} />
       <Route path="/join-queue" element={<JoinQueuePage />} />
       <Route path="/profile" element={<ProfilePage />} />
       <Route path="/emergency-watch" element={<EmergencyWatchPage />} />
       <Route path="/admin/queue/:departmentId" element={<AdminQueuePage />} />
       <Route path="/health-setup" element={<HealthOnboardingPage />} />
      </Routes>
      <RealtimeAudioPopup />
    </>
  )
}

export default App
