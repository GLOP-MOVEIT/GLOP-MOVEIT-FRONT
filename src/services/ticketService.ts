import apiClient from '@/services/api'
import type {
  Ticket,
  TicketApiModel,
  TicketImportPayload,
  TicketPageResponse,
  TicketVerificationResponse,
} from '@/types/ticket'

const DEFAULT_PAGE_SIZE = 100

const formatQrDate = (value: string) => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const getPublicAppBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')
    return `${window.location.origin}${basePath}`
  }

  return ''
}

const buildTicketVerificationUrl = (validationToken?: string | null) => {
  if (!validationToken) {
    return null
  }

  const publicBaseUrl = getPublicAppBaseUrl()
  if (!publicBaseUrl) {
    return null
  }

  return `${publicBaseUrl}/billetterie/verification/${encodeURIComponent(validationToken)}`
}

const buildTicketQrData = (ticket: TicketApiModel) => {
  const verificationUrl = buildTicketVerificationUrl(ticket.validationToken)

  if (verificationUrl) {
    return verificationUrl
  }

  return [
    'MOVEIT_TICKET',
    `ticketNumber=${ticket.ticketNumber}`,
    `seat=${ticket.seatInformation}`,
    `date=${formatQrDate(ticket.eventDate)}`,
  ].join('\n')
}

const mapApiTicket = (ticket: TicketApiModel, email?: string): Ticket => {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    email,
    seatInfo: ticket.seatInformation,
    eventDate: ticket.eventDate,
    validationToken: ticket.validationToken,
    qrData: buildTicketQrData(ticket),
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

export const verifyTicket = async (validationToken: string): Promise<TicketVerificationResponse> => {
  const { data } = await apiClient.get<TicketVerificationResponse>(
    `/tickets/verify/${encodeURIComponent(validationToken)}`
  )

  return data
}
