import "./pages/index.css"
import React from 'react'
import { createRoot } from 'react-dom/client'
import 'semantic-ui-css/semantic.min.css'
import App from './pages/App'
import LoginPage from "./pages/login"

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <LoginPage />
  </React.StrictMode>
)
