import { create } from 'zustand'

const persistedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
const persistedRole = typeof localStorage !== 'undefined' ? localStorage.getItem('role') : null

export const useAuth = create((set) => ({
  token: persistedToken,
  role: persistedRole || 'admin',
  user: persistedToken ? { username: 'admin1', firstName: 'System', lastName: 'Admin' } : null,
  login: async ({ username, password }) => {
    // MOCK: Accept any username/password; set admin for demos
    const fakeToken = 'mock-jwt-token'
    const role = username === 'hr' ? 'hr' : username === 'manager' ? 'manager' : 'admin'
    localStorage.setItem('token', fakeToken)
    localStorage.setItem('role', role)
    set({ token: fakeToken, role, user: { username, firstName: 'Demo', lastName: 'User' } })
    return { token: fakeToken, role }
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    set({ token: null, role: null, user: null })
  }
}))
