import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeTheme } from './theme.ts'
import { AuthProvider } from './auth.tsx'
import { ToastProvider } from './components/Toast.tsx'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider>
  </StrictMode>,
)
