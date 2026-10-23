/* dates.ts
 * Date utilities for SaintsHub
 * Provides: formatting, parsing, comparison, and date operations
 */

import { formatDate, parseDateFromString, getToday } from "@/lib/config"

/**
 * Format date in various formats
 * @param date Date string or Date object
 * @param format Format string ("dd/MM/yyyy", "yyyy-MM-dd", "MMM dd, yyyy", etc.)
 * @returns formatted date string
 */
export function format(date: Date | string | null | undefined, format: "dd/MM/yyyy" | "yyyy-MM-dd" | "MMM dd, yyyy" = "dd/MM/yyyy"): string {
  if (!date) return ""

  const d = typeof date === "string" ? new Date(date) : date
  if (d instanceof Date && !isNaN(d.getTime())) {
    switch (format) {
      case "dd/MM/yyyy":
        const day = String(d.getDate()).padStart(2, "0")
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const year = d.getFullYear()
        return `${day}/${month}/${year}`

      case "yyyy-MM-dd":
        return d.toISOString().split("T")[0]

      case "MMM dd, yyyy":
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ]
        return `${months[d.getMonth()]} ${d.getDate()}, ${year}`

      default:
        return formatDate(d, format)
    }
  }
  return ""
}

/**
 * Parse date string to Date object
 * Supports: dd/MM/yyyy, yyyy-MM-dd, MM/dd/yyyy, etc.
 */
export function parse(dateStr: string, format: "dd/MM/yyyy" | "yyyy-MM-dd" | "MM/dd/yyyy" = "dd/MM/yyyy"): Date | null {
  if (!dateStr) return null

  let date: Date

  switch (format) {
    case "dd/MM/yyyy":
      const parts1 = dateStr.split("/")
      if (parts1.length === 3) {
        const day = parseInt(parts1[0])
        const month = parseInt(parts1[1]) - 1
        const year = parseInt(parts1[2])
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          date = new Date(year, month, day)
          if (!isNaN(date.getTime())) return date
        }
        break

    case "yyyy-MM-dd":
      const parsed = new Date(dateStr)
      if (!isNaN(parsed.getTime())) return parsed
      break

    case "MM/dd/yyyy":
      const parts2 = dateStr.split("/")
      if (parts2.length === 3) {
        const month = parseInt(parts2[0])
        const day = parseInt(parts2[1])
        const year = parseInt(parts2[2])
        if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
          date = new Date(year, month - 1, day)
          if (!isNaN(date.getTime())) return date
        }
        break
      }
      break
  }

  return null
}

/**
 * Get difference between two dates in days
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const startDate = start instanceof Date ? start : new Date(start)
  const endDate = end instanceof Date ? end : new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get date after adding days
 */
export function addDays(date: Date | string, days: number): Date {
  const d = date instanceof Date ? date : new Date(date)
  const result = new Date(d)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Get date before subtracting days
 */
export function subtractDays(date: Date | string, days: number): Date {
  const d = date instanceof Date ? date : new Date(date)
  const result = new Date(d)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = date1 instanceof Date ? date1 : new Date(date1)
  const d2 = date2 instanceof Date ? date2 : new Date(date2)
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
}

/**
 * Check if date is before another date
 */
export function isBefore(date1: Date | string, date2: Date | string): boolean {
  const d1 = date1 instanceof Date ? date1 : new Date(date1)
  const d2 = date2 instanceof Date ? date2 : new Date(date2)
  return d1 < d2
}

/**
 * Check if date is after another date
 */
export function isAfter(date1: Date | string, date2: Date | string): boolean {
  const d1 = date1 instanceof Date ? date1 : new Date(date1)
  const d2 = date2 instanceof Date ? date2 : new Date(date2)
  return d1 > d2
}

/**
 * Get start of day for a date
 */
export function startOfDay(date: Date | string): Date {
  const d = date instanceof Date ? date : new Date(date)
  const result = new Date(d)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get end of day for a date
 */
export function endOfDay(date: Date | string): Date {
  const d = date instanceof Date ? date : new Date(date)
  const result = new Date(d)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Get start of month for a date
 */
export function startOfMonth(date: Date | string): Date {
  const d = date instanceof Date ? date : new Date(date)
  const result = new Date(d)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get end of month for a date
 */
export function endOfMonth(date: Date | string): Date {
  const d = date instanceof Date ? date : new Date(date)
  const result = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Format date relative to now (e.g., "2 days ago", "in 3 days")
 */
export function formatRelative(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const now = getToday()
  const diffDays = daysBetween(d, now)

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays === -1) return "Tomorrow"
  if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 0 && diffDays > -7) return `in ${Math.abs(diffDays)} days`

  return format(date, "dd/MM/yyyy")
}

/**
 * Is date within a range?
 */
export function isWithinRange(
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean {
  const d = date instanceof Date ? date : new Date(date)
  const s = start instanceof Date ? start : new Date(start)
  const e = end instanceof Date ? end : new Date(end)
  return isAfter(d, s) && isBefore(d, e)
}