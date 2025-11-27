import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { GroupProvider } from './context/GroupContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GroupProvider>
        <App />
      </GroupProvider>
    </BrowserRouter>
  </React.StrictMode>,
)