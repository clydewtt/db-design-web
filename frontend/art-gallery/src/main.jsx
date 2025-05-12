import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logo from './assets/logo.svg'
import MetallicPaint from "./blocks/Animations/MetallicPaint/MetallicPaint.jsx"

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <App />
  </StrictMode>,
)
