import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../lib/adminAuth'
import Button from '../../components/Button'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loginAdmin(email, password)) {
      navigate('/admin/dashboard')
    } else {
      setError('Identifiants invalides.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-paper p-8">
        <div className="mb-6 flex items-center gap-2">
          <img src="/logo.jpg" alt="Tout S'8 Delivery" className="h-9 w-9 rounded-lg object-cover" />
          <span className="font-display text-lg font-semibold">Espace livreur</span>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            required
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">Mot de passe</span>
          <input
            type="password"
            required
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="mt-3 rounded-lg bg-alert/10 p-3 text-sm text-alert">{error}</div>}
        <Button type="submit" className="mt-6 w-full">Se connecter</Button>
      </form>
    </div>
  )
}
