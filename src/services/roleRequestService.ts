import apiClient from '@/services/api'

export interface VolunteerRequestPayload {
  coverLetter: string
}

export const requestAthletePromotion = async (userId: number) => {
  const { data } = await apiClient.post(`/requests/athlete/${userId}`)
  return data
}

export const requestVolunteerPromotion = async (
  userId: number,
  payload: VolunteerRequestPayload
) => {
  const { data } = await apiClient.post(`/requests/volunteer/${userId}`, payload)
  return data
}
