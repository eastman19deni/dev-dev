import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './styles/index.css'
import App from "./app/App"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-center"
      richColors
      expand={false}
      duration={3000}
    />
  </StrictMode>,
)