export interface Ranking {
  id: number
  score: string
  position: number
}

export interface Result {
  resultId?: number
  trialId: number
  lastTrial: boolean
  rankings: Ranking[]
}
