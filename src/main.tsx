import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { requestPersist } from './lib/storage.ts'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/800.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/600.css'
import '@fontsource/figtree/700.css'
import './styles/tokens.css'
import './styles/app.css'

void requestPersist()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
