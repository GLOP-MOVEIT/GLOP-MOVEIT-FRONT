import apiClient from '@/services/api'
import type {
  Ticket,
  TicketApiModel,
  TicketImportPayload,
  TicketPageResponse,
} from '@/types/ticket'

const DEFAULT_PAGE_SIZE = 100

const buildTicketQrData = (ticket: TicketApiModel, email?: string) => {
  return JSON.stringify({
    ticketId: ticket.id ?? null,
    ticketNumber: ticket.ticketNumber,
    seatInformation: ticket.seatInformation,
    eventDate: ticket.eventDate,
    email: email ?? null,
  })
}

const mapApiTicket = (ticket: TicketApiModel, email?: string): Ticket => {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    email,
    eventType: null,
    seatInfo: ticket.seatInformation,
    eventDate: ticket.eventDate,
    qrData: buildTicketQrData(ticket, email),
  }
}

const toIsoDate = (value: string) => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('ticket-invalid-date')
  }

  return parsedDate.toISOString()
}

export const getUserTickets = async (
  userId: number,
  userEmail?: string
): Promise<Ticket[]> => {
  const { data } = await apiClient.get<TicketPageResponse>(`/tickets/${userId}`, {
    params: {
      size: DEFAULT_PAGE_SIZE,
      sort: 'eventDate,desc',
    },
  })

  return data.content.map((ticket) => mapApiTicket(ticket, userEmail))
}

export const importTicket = async (
  userId: number,
  payload: TicketImportPayload,
  userEmail?: string
): Promise<Ticket> => {
  if (
    userEmail &&
    payload.email.trim().toLowerCase() !== userEmail.trim().toLowerCase()
  ) {
    throw new Error('ticket-email-mismatch')
  }

  const { data } = await apiClient.post<TicketApiModel>(`/tickets/${userId}`, {
    ticketNumber: payload.ticketNumber.trim(),
    seatInformation: payload.seatInfo.trim(),
    eventDate: toIsoDate(payload.eventDate),
  })

  return mapApiTicket(data, userEmail ?? payload.email)
}
