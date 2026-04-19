import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Toast from './components/Toast'
import Vitrine  from './pages/Vitrine'
import Checkout from './pages/Checkout'
import Login    from './pages/Login'
import Admin    from './pages/Admin'
import './themes/wavepod.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Vitrine />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/admin"   element={<Admin />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
)
