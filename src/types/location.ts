export interface Location {
  locationId: number
  name: string
  latitude: number
  longitude: number
  mainEntrance: string
  refereeEntrance: string
  athleteEntrance: string
  description: string
}

export type LocationPayload = Omit<Location, 'locationId'>

export interface LocateRequest {
  requesterId: number
  targetId: number
  trialId?: number | null
}

export interface LocateResponse {
  latitude: number
  longitude: number
}

export interface LocateTrialRequest {
  requesterId: number
  trialId: number
}

export interface LocatedTrialUserPosition {
  userId: number
  firstName: string
  surname: string
  latitude: number
  longitude: number
}

export interface LocateTrialResponse {
  trialId: number
  athletes: LocatedTrialUserPosition[]
  volunteers: LocatedTrialUserPosition[]
}
