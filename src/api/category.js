import api from '@/api/axios.js'

export async function getCategories() {
  const res = await api.get('/api/hq/categories')
  return res.data.result
}

export async function getCategory(code) {
  const res = await api.get(`/api/hq/categories/${code}`)
  return res.data.result
}

export async function createCategory(payload) {
  const res = await api.post('/api/hq/categories', payload)
  return res.data.result
}
