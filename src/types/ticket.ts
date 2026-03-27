export interface Ticket {
  id?: number
  ticketNumber: string
  email?: string
  seatInfo?: string | null
  eventDate?: string | null
  validationToken?: string | null
  qrData?: string | null
}

export interface TicketImportPayload {
  ticketNumber: string
  email: string
  seatInfo: string
  eventDate: string
}

export interface TicketApiModel {
  id?: number
  ticketNumber: string
  seatInformation: string
  eventDate: string
  validationToken?: string | null
}

export interface TicketVerificationResponse {
  ticketId: number
  ticketNumber: string
  seatInformation: string
  eventDate: string
  valid: boolean
}

export interface TicketPageResponse {
  content: TicketApiModel[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
