// config.ts
// Utility functions and component variants for SaintsHub

import { clsx } from "clsx"

/**
 * Merge class names using clsx
 * Similar to tailwind-merge but simpler for our use case
 */
export function cn(...classes: string[]) {
  return clsx(classes)
}

/**
 * Format KES amount to string with comma separators
 */
export function formatCurrency(amount: number | string, currency: string = "KES"): string {
  const num = typeof amount === "string" ? parseInt(amount) : amount
  if (isNaN(num)) return "0.00"

  // Format with comma separators
  const formatted = num.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${currency} ${formatted}`
}

/**
 * Parse KES amount from string (e.g., "KSh 12,500.00" or "12500")
 */
export function parseCurrency(amount: string): number {
  // Remove KSh and spaces, replace commas
  const cleaned = amount
    .replace(/KSh\s*/i, "")
    .replace(/,/g, "")
    .trim()

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format date in dd/MM/yyyy format (Kenya standard)
 */
export function formatDate(date: Date | string | null | undefined, format: "dd/MM/yyyy" = "dd/MM/yyyy"): string {
  if (!date) return ""

  const d = typeof date === "string" ? new Date(date) : date
  if (d instanceof Date && !isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }
  return ""
}

/**
 * Parse date from dd/MM/yyyy format
 */
export function parseDateFromString(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split("/")
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
  const year = parseInt(parts[2])
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  const date = new Date(year, month, day)
  if (isNaN(date.getTime())) return null
  return date
}

/**
 * Get current date in Africa/Nairobi timezone
 */
export function getToday(): Date {
  // Africa/Nairobi is UTC+3, no DST
  return new Date()
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: any, roleKey: string): boolean {
  if (!user?.roles) return false
  return user.roles.some((r: any) => r.key === roleKey)
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: any, roleKeys: string[]): boolean {
  if (!user?.roles) return false
  return user.roles.some((r: any) => roleKeys.includes(r.key))
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: any, roleKeys: string[]): boolean {
  if (!user?.roles) return false
  return roleKeys.every((key) => user.roles.some((r: any) => r.key === key))
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Deep merge two objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key], source[key] as T[keyof T])
    } else {
      result[key] = source[key] as any
    }
  }
  return result
}

/**
 * Debounce a function - delays execution until after wait milliseconds
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

/**
 * Check if value is in array (case-insensitive)
 */
export function includesCaseInsensitive<T>(arr: T[], value: T): boolean {
  return arr.some((item) => {
    const itemStr = String(item).toLowerCase()
    const valueStr = String(value).toLowerCase()
    return itemStr === valueStr
  })
}

/**
 * Generate a random ID for temporary use (e.g., unsaved forms)
 */
export function generateId(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export { deepMerge }