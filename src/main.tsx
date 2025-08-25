import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './index.scss'
import PWABadge from './service-worker-registration/PWABadge/PWABadge.tsx'
import { createBrowserHistory } from 'history'
import { RouterProvider } from './corelib/router/react-components.tsx'
import { Router } from './router/Router.tsx'

const browserHistory = createBrowserHistory();

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <RouterProvider history={browserHistory}>
      <PWABadge />
      <Router />
    </RouterProvider>
  </StrictMode>,
)

const handleError = () => root.unmount();
self.addEventListener('error', handleError)
self.addEventListener('unhandledrejection', handleError)
