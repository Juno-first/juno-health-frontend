import './App.css'
import LoginPage from './pages/LoginPage'
import CreateAccountPage from './pages/CreateAccountPage'
import { Routes, Route } from 'react-router-dom'


function App() {

  return (
    <>
      <Routes>
       <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<CreateAccountPage />} />
      </Routes>
    </>
  )
}

export default App
