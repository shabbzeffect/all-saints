/* money.ts
 * Money/currency utilities for SaintsHub
 * Provides: currency formatting, parsing, conversion, and formatting
 */

import { formatCurrency, parseCurrency } from "@/lib/config"

/**
 * Format amount as KES with two decimal places
 */
export function formatKES(amount: number | string): string {
  return formatCurrency(amount, "KES")
}

/**
 * Parse KES string to number
 * Handles "KSh 1,000.00", "1000", "KES 500.50" formats
 */
export function parseKES(amount: string): number {
  return parseCurrency(amount)
}

/**
 * Format amount as USD
 */
export function formatUSD(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "$0.00"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num)
}

/**
 * Format amount as Ugandan Shilling (UGX)
 */
export function formatUGX(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "USh 0.00"
  return new Intl.NumberFormat("ug", {
    style: "currency",
    currency: "UGX",
  }).format(num)
}

/**
 * Format amount as Tanzanian Shilling (TZS)
 */
export function formatTZS(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "TSh 0.00"
  return new Intl.NumberFormat("tz", {
    style: "currency",
    currency: "TZS",
  }).format(num)
}

/**
 * Convert KES to another currency (uses approximate rates)
 * @param amount amount in KES
 * @param toCurrency target currency code (USD, UGX, TZS)
 * @returns formatted string in target currency
 */
export function convertCurrency(
  amount: number | string,
  toCurrency: "USD" | "UGX" | "TZS" = "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return `${toCurrency} 0.00`

  const rates: Record<string, number> = {
    USD: 0.0082,
    UGX: 3.72,
    TZS: 2.14,
  }

  const rate = rates[toCurrency] || 1
  const converted = num * rate

  switch (toCurrency) {
    case "USD":
      return formatUSD(converted)
    case "UGX":
      return formatUGX(converted)
    case "TZS":
      return formatTZS(converted)
    default:
      return formatCurrency(converted)
  }
}

/**
 * Calculate total from array of payment amounts
 */
export function calculateTotal(amounts: (number | string)[]): number {
  return amounts.reduce(
    (total, amount) => total + (typeof amount === "string" ? parseFloat(amount) : amount),
    0
  )
}

/**
 * Calculate subtotal after tax
 * @param amounts array of amounts
 * @param taxRate tax percentage (e.g., 16 for 16%)
 * @returns object with subtotal, tax, total
 */
export function calculateWithTax(
  amounts: (number | string)[],
  taxRate: number
): { subtotal: number; tax: number; total: number } {
  const subtotal = calculateTotal(amounts)
  const tax = (subtotal * taxRate) / 100
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  }
}