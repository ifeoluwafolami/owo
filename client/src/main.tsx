import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeTheme } from './theme.ts'
import { AuthProvider } from './auth.tsx'
import { ToastProvider } from './components/Toast.tsx'
import { PrivacyProvider } from './privacy.tsx'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider><AuthProvider><PrivacyProvider><App /></PrivacyProvider></AuthProvider></ToastProvider>
  </StrictMode>,
)
