import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";        
window.bootstrap = bootstrap;                  
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./index.css";

createRoot(document.querySelector('#root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
