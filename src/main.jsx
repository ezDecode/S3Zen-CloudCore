import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { TeamProvider } from './contexts/TeamContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TeamProvider>
      <App />
    </TeamProvider>
  </StrictMode>,
)
