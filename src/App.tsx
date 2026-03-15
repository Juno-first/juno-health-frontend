import './App.css'
import LoginPage from './pages/LoginPage'
import CreateAccountPage from './pages/CreateAccountPage'
import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/Dashborard'
import ERQueuePage from './pages/ERQueuePage'
import JoinQueuePage from './pages/JoinQueuePage'
import { RealtimeAudioPopup } from './components/RealtimeAudioPopup'

function App() {

  return (
    <>
      <Routes>
       <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<CreateAccountPage />} />
       <Route path="/dashboard" element={<DashboardPage />} />
       <Route path="/er-queue" element={<ERQueuePage />} />
       <Route path="/join-queue" element={<JoinQueuePage />} />
      </Routes>
      <RealtimeAudioPopup />

    </>
  )
}

export default App
