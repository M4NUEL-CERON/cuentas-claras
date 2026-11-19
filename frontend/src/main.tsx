import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/baloo-2/latin-600.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource-variable/dm-sans/wght.css'
import '@fontsource/caveat/latin-600.css'
import './styles.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
