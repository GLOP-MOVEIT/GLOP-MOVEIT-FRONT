import type { Ticket } from '@/types/ticket'

const STORAGE_KEY = 'ticketingTickets'

export const getStoredTickets = (): Ticket[] => {
  if (globalThis.window === undefined) {
    return []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as Ticket[]
    }
  } catch {
    return []
  }

  return []
}

export const storeTickets = (tickets: Ticket[]) => {
  if (globalThis.window === undefined) {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
}

export const addStoredTicket = (ticket: Ticket): Ticket[] => {
  const existing = getStoredTickets()
  const updated = [ticket, ...existing]
  storeTickets(updated)
  return updated
}
