import { formatDistanceToNow, format, parseISO } from "date-fns"

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString)
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, "PPp") // Format like "Apr 29, 2023, 3:56 PM"
}
