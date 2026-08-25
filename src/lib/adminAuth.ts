// v1 admin auth: a single local session flag, since this is a one-person
// operation. Swap for real Supabase Auth (supabase.auth.signInWithPassword)
// once the project is wired — AdminGuard below already reads from here so
// only this file changes.

const KEY = 'atlas_livraison_admin_session'

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(KEY) === 'true'
}

export function loginAdmin(email: string, password: string): boolean {
  // Placeholder check for the standalone demo. Real version calls
  // supabase.auth.signInWithPassword({ email, password }).
  if (email && password.length >= 4) {
    localStorage.setItem(KEY, 'true')
    return true
  }
  return false
}

export function logoutAdmin() {
  localStorage.removeItem(KEY)
}
