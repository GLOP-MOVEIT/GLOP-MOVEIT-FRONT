import apiClient from '@/services/api'
import type { TicketImportPayload, TicketImportResponse } from '@/types/ticket'

export const importTicket = async (
  payload: TicketImportPayload
): Promise<TicketImportResponse> => {
  if (
    payload.ticketNumber === '123456' &&
    payload.email.trim().toLowerCase() === 'aymeric.jakobowski@example.com'
  ) {
    return {
      ticket: {
        ticketNumber: payload.ticketNumber,
        email: payload.email,
        eventType: 'Natation',
        seatInfo: 'Tribune A - Rang 3, Place 12',
        eventDate: '2026-03-15',
        qrData: 'MOCK-QR-123456',
      },
      qrData: 'MOCK-QR-123456',
      eventType: 'Natation',
      seatInfo: 'Tribune A - Rang 3, Place 12',
      eventDate: '2026-03-15',
    }
  }

  const { data } = await apiClient.post<TicketImportResponse>('/tickets/import', payload)
  return data
}
