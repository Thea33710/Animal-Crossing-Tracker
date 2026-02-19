import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('act_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('act_token')
      localStorage.removeItem('act_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (email, password) => api.post('/auth/signup', { email, password }),
  login:  (email, password) => api.post('/auth/login',  { email, password }),
  me:     ()                => api.get('/auth/me'),
}

// ─── Islands ──────────────────────────────────────────────────────────────
export const islandsApi = {
  list:   ()                        => api.get('/islands'),
  create: (name, hemisphere)        => api.post('/islands', { name, hemisphere }),
  update: (id, data)                => api.put(`/islands/${id}`, data),
}

// ─── Creatures / Creopedia ────────────────────────────────────────────────
export const creaturesApi = {
  list:   (params = {})            => api.get('/creatures', { params }),
  toggle: (creature_id, collected, island_id) =>
    api.post('/creopedia/toggle', { creature_id, collected, island_id }),
  stats:  (island_id)              => api.get('/creopedia/stats', { params: { island_id } }),
}

export default api
