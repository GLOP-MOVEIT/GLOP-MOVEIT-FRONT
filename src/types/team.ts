import type { User } from './user'

export interface Team {
  teamId?: number
  name: string
  athletes: User[]
}

export interface CreateTeamPayload {
  name: string
}

