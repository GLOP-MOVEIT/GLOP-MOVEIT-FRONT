/**
 * Formate une date pour l'envoyer au backend (format ISO)
 */
export function formatDateForBackend(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString()
  }
  if (typeof date === 'string') {
    if (date.includes('T')) {
      return date
    }
    return `${date}T00:00:00.000Z`
  }
  return String(date)
}

/**
 * Formate une date pour l'affichage (ex: "9 mars 2026")
 */
export function formatDate(dateStr: string | Date, locale = 'fr-FR'): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Formate une date avec l'heure pour l'affichage (ex: "9 mars 2026 à 14:30")
 */
export function formatDateTime(dateStr: string | Date, locale = 'fr-FR'): string {
  if (!dateStr) return '-'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Formate une plage de dates pour l'affichage (ex: "9 mars 2026 → 15 mars 2026")
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date, locale = 'fr-FR'): string {
  return `${formatDate(startDate, locale)} → ${formatDate(endDate, locale)}`
}

/**
 * Formate une plage d'horaires pour l'affichage (ex: "14:30 → 16:00")
 */
export function formatTimeRange(startDate: string | Date, endDate: string | Date, locale = 'fr-FR'): string {
  const startDateTime = typeof startDate === 'string' ? new Date(startDate) : startDate
  const endDateTime = typeof endDate === 'string' ? new Date(endDate) : endDate

  const localeString = locale === 'fr' || locale === 'fr-FR' ? 'fr-FR' : 'en-US'
  const startTime = startDateTime.toLocaleTimeString(localeString, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endTime = endDateTime.toLocaleTimeString(localeString, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${startTime} → ${endTime}`
}

