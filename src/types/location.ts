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
