import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageReactViteStarter from './pages/PageReactViteStarter/PageReactViteStarter.tsx'
import PWABadge from './service-worker-registration/PWABadge/PWABadge.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageReactViteStarter />
    <PWABadge />
  </StrictMode>,
)
