export interface Ticket {
  ticketNumber: string
  email: string
  eventType?: string
  seatInfo?: string
  eventDate?: string
  qrData?: string | null
}

export interface TicketImportPayload {
  ticketNumber: string
  email: string
}

export interface TicketImportResponse {
  ticket?: Ticket
  qrData?: string | null
  token?: string | null
  qrCode?: string | null
  eventType?: string
  seatInfo?: string
  eventDate?: string
}
