import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './index.scss'
import PWABadge from './service-worker-registration/PWABadge/PWABadge.tsx'
import { createBrowserHistory } from 'history'
import { RouterProvider } from './corelib/router/react-components.tsx'
import { Router } from './router/Router.tsx'

const browserHistory = createBrowserHistory();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider history={browserHistory}>
      <PWABadge />
      <Router />
    </RouterProvider>
  </StrictMode>,
)
