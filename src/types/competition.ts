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
  events?: Event[]
  trials?: Trial[]
}

export interface Event {
  id: number
  competitionId?: number
  competition?: Competition
  name: string
  description: string
  startDate: string | Date
  endDate: string | Date
  status: Status
}

export interface Trial {
  id: number
  competition?: Competition
  name: string
  description: string
  startDate: string | Date
  endDate: string | Date
  status: Status
}

