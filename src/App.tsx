import './App.css'
import LoginPage from './pages/LoginPage'
import CreateAccountPage from './pages/CreateAccountPage'
import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/Dashborard'


function App() {

  return (
    <>
      <Routes>
       <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<CreateAccountPage />} />
       <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  )
}

export default App
