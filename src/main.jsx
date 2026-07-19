import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { WeddingProvider } from './store.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WeddingProvider>
      <App />
    </WeddingProvider>
  </React.StrictMode>,
)
