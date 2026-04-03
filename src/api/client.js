const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('crm_token') || ''
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status, data })
  return data
}

export const adminLogin = (email, password) =>
  request('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })

/** Google SSO login — returns { token, user } where user.isAdmin must be true */
export const googleLogin = (credential) =>
  request('/auth/google/login', { method: 'POST', body: JSON.stringify({ credential }) })

/**
 * Add or set publishing credits for a user.
 * Pass { add: n } to add/subtract, or { set: n } for an absolute value.
 */
export const updateUserCredits = (userId, payload) =>
  request(`/admin/users/${userId}/credits`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const getMetrics = () => request('/admin/metrics')

export const getGrowthChart = (days = 30) => request(`/admin/charts/growth?days=${days}`)

export const getUsers = (params = {}) => {
  const q = new URLSearchParams()
  if (params.page)     q.set('page', params.page)
  if (params.limit)    q.set('limit', params.limit)
  if (params.search)   q.set('search', params.search)
  if (params.authType) q.set('authType', params.authType)
  return request(`/admin/users?${q}`)
}

export const getUserDetail = (id) => request(`/admin/users/${id}`)

export const getSites = (params = {}) => {
  const q = new URLSearchParams()
  if (params.page)   q.set('page', params.page)
  if (params.limit)  q.set('limit', params.limit)
  if (params.search) q.set('search', params.search)
  if (params.status) q.set('status', params.status)
  return request(`/admin/sites?${q}`)
}

export const getPayments = (params = {}) => {
  const q = new URLSearchParams()
  if (params.page)   q.set('page', params.page)
  if (params.limit)  q.set('limit', params.limit)
  if (params.status) q.set('status', params.status)
  return request(`/admin/payments?${q}`)
}
