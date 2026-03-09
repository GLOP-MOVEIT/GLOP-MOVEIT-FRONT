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
 * Formate une plage de dates pour l'affichage (ex: "9 mars 2026 → 15 mars 2026")
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date, locale = 'fr-FR'): string {
  return `${formatDate(startDate, locale)} → ${formatDate(endDate, locale)}`
}

