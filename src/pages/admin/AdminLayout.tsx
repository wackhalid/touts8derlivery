import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { isAdminLoggedIn, logoutAdmin } from '../../lib/adminAuth'

const NAV = [
  { to: '/admin/dashboard', label: 'Tableau de bord' },
  { to: '/admin/orders', label: 'Commandes' },
  { to: '/admin/customers', label: 'Clients' },
  { to: '/admin/settings', label: 'Réglages' },
]

export default function AdminLayout() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Tout S'8 Delivery" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display font-semibold">Tout S'8 Delivery</span>
          </div>
          <button
            onClick={() => { logoutAdmin(); window.location.href = '/admin/login' }}
            className="text-xs font-medium text-slate-soft hover:text-alert"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-line bg-white">
        <div className="mx-auto flex max-w-3xl">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-xs font-medium ${isActive ? 'text-ink border-t-2 border-amber -mt-px' : 'text-slate-soft'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
