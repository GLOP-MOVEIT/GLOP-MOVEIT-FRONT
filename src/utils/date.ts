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

