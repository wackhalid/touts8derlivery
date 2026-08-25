import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { seedDemoDataIfEmpty } from './lib/store'
import { LanguageProvider } from './lib/i18n'

import Home from './pages/public/Home'
import Services from './pages/public/Services'
import Contact from './pages/public/Contact'
import RequestDelivery from './pages/public/RequestDelivery'
import OrderConfirmation from './pages/public/OrderConfirmation'
import Track from './pages/public/Track'

import Login from './pages/admin/Login'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import OrderDetail from './pages/admin/OrderDetail'
import Customers from './pages/admin/Customers'
import Settings from './pages/admin/Settings'

export default function App() {
  useEffect(() => {
    seedDemoDataIfEmpty()
  }, [])

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/request-delivery" element={<RequestDelivery />} />
          <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/track" element={<Track />} />
          <Route path="/track/:orderNumber" element={<Track />} />

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderNumber" element={<OrderDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
