import axios from 'axios'
import type { Location, LocationPayload } from '@/types/location'

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL
const API_URL = configuredApiUrl === undefined ? 'http://localhost:8080' : configuredApiUrl

export const locationService = {
  getToken(): string | null {
    return localStorage.getItem('authToken')
  },

  getAuthHeaders() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  async getAllLocations(): Promise<Location[]> {
    const response = await axios.get<Location[]>(`${API_URL}/locations`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  },

  async getLocationById(id: number): Promise<Location> {
    const response = await axios.get<Location>(`${API_URL}/locations/${id}`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  },

  async createLocation(location: LocationPayload): Promise<Location> {
    const response = await axios.post<Location>(`${API_URL}/locations`, location, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return response.data
  },

  async updateLocation(id: number, location: LocationPayload): Promise<Location> {
    const response = await axios.put<Location>(`${API_URL}/locations/${id}`, location, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    })
    return response.data
  },

  async deleteLocation(id: number): Promise<void> {
    await axios.delete(`${API_URL}/locations/${id}`, {
      headers: this.getAuthHeaders(),
    })
  },
}

export default locationService
