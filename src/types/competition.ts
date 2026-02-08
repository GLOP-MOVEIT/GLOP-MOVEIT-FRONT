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

export interface Championship {
  id: number
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: Status
  competitions: Competition[]
}

export interface Competition {
  competitionId: number
  championship?: Championship
  competitionSport: string
  competitionName: string
  competitionDescription: string
  competitionStartDate: string
  competitionEndDate: string
  competitionStatus: Status
  nbManches: number
  events?: Event[]
}

export interface Event {
  id: number
  competition: Competition
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: Status
}
