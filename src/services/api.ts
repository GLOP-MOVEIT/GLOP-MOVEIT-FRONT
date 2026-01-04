import axios, { type AxiosInstance, type AxiosError } from 'axios'

// Configuration de base pour les appels API
// Si VITE_API_BASE_URL est défini (même vide), l'utilise pour le proxy nginx
// Sinon utilise localhost pour le développement local
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'http://localhost:8080'

// Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Gestion des erreurs globales
    if (error.response?.status === 401) {
      // Token expiré ou invalide - rediriger vers login
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default apiClient
