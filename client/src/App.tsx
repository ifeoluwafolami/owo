import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Homepage from './pages/Homepage'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import Savings from './pages/Savings'
import Spending from './pages/Spending'
import Overview from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/signup" element={<Auth initialMode="signup" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/spending" element={<Spending />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
