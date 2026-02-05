const MONTHS_FO = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']

export function formatDateFO(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()}. ${MONTHS_FO[d.getMonth()]}`
}

/** Week number of year (1–53) for a date string */
export function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}
