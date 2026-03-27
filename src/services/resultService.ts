import apiClient from '@/services/api'
import type { Result } from '@/types/result'

const resultService = {
  async getResultByTrialId(trialId: number): Promise<Result> {
    const { data } = await apiClient.get<Result>(`/results/trial/${trialId}`)
    return data
  },

  async saveResult(result: Result): Promise<Result> {
    const { data } = await apiClient.post<Result>('/results', result)
    return data
  },

  async updateResult(result: Result): Promise<Result> {
    const { data } = await apiClient.put<Result>('/results', result)
    return data
  },

  async getAllResultsByParticipantId(participantId: number): Promise<Result[]> {
    const { data } = await apiClient.get<Result[]>(`/results/participant/${participantId}`)
    return data
  },
}

export default resultService
