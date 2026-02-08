export enum Status {
  PLANNED = 'PLANNED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  id: number
  championship: Championship
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: Status
  events: Event[]
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
