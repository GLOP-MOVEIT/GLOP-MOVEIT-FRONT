export enum Status {
  PLANNED = 'PLANNED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Sport {
  ATHLETICS = 'ATHLETICS',
  SWIMMING = 'SWIMMING',
  CYCLING = 'CYCLING',
  FOOTBALL = 'FOOTBALL',
  BASKETBALL = 'BASKETBALL',
  TENNIS = 'TENNIS',
  VOLLEYBALL = 'VOLLEYBALL',
  GYMNASTICS = 'GYMNASTICS',
  SKIING = 'SKIING',
  SKATING = 'SKATING',
  CLIMBING = 'CLIMBING',
  ROWING = 'ROWING',
  JUDO = 'JUDO',
  FENCING = 'FENCING',
  ARCHERY = 'ARCHERY',
}

export enum ParticipantType {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
}

export enum ResultUnit {
  POINTS = 'POINTS',
  MINUTES = 'MINUTES',
  SECONDS = 'SECONDS',
  HOURS = 'HOURS',
}

export interface Championship {
  id: number
  name: string
  description: string
  startDate: string | Date
  endDate: string | Date
  status: Status
  competitions?: Competition[]
}

export interface Competition {
  competitionId: number
  championshipId?: number
  championship?: { id: number }
  competitionSport: string
  competitionName: string
  competitionDescription: string
  competitionStartDate: string
  competitionEndDate: string
  competitionStatus: Status
  participantType: ParticipantType
  competitionType: string
  maxPerHeat: number
  nbManches: number
  assignedCommissaireId?: number | null
  competitionResultUnit?: ResultUnit | null
  events?: CompetitionTreeEvent[]
  trials?: Trial[]
}

export type CompetitionPayload = Omit<Competition, 'competitionId' | 'events' | 'trials'>

export interface CompetitionFormValues {
  championshipId: number | null
  sport: string
  participantType: ParticipantType
  type: string
  maxPerHeat: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: Status
  nbManches: number
  assignedCommissaireId: number | null
  resultUnit: ResultUnit | null
}

export interface CompetitionTreeEvent {
  eventId: string
  eventName: string
  eventDate: string
  eventDescription: string
}

export interface Trial {
  trialId: number
  trialName: string
  trialStartDate: string
  trialEndDate: string
  trialDescription: string
  trialStatus: Status
  locationId: number | null
  roundNumber: number
  position: number
  nextTrialId: number | null
  competitionId: number
  participantIds: number[]
}

export interface CompetitionTreeResult extends Competition {
  events?: CompetitionTreeEvent[]
  trials?: Trial[]
}
