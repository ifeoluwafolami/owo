import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeTheme } from './theme.ts'
import { AuthProvider } from './auth.tsx'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider><App /></AuthProvider>
  </StrictMode>,
)
