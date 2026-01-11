export enum CompetitionStatus {
  PLANNED = 'PLANNED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
}

export type EventType = string
export type Place = Record<string, never>

export interface Competition {
  competitionId: string
  competition: Competition[]
  competitionSport: string
  competitionName: string
  competitionStartDate: Date
  competitionEndDate: Date
  competitionDescription: string
  competitionStatus: CompetitionStatus
  events: Event[]
}

export interface Event {
  eventId: string
  competition: Competition
  place: Place
  eventName: string
  eventStartDate: Date
  eventEndDate: Date
  eventDescription: string
  eventType: EventType
  eventStatus: EventStatus
}
