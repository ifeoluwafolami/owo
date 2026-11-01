import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Homepage from './pages/Homepage'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import Savings from './pages/Savings'
import Spending from './pages/Spending'
import Overview from './pages/Overview'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import VerifyEmail from './pages/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Auth key="login" initialMode="login" />} />
        <Route path="/signup" element={<Auth key="signup" initialMode="signup" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/spending" element={<Spending />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
