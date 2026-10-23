/* phone.ts
 * Phone number utilities for SaintsHub
 * Provides: validation, formatting, parsing for Kenya and regional numbers
 */

import { isValid as isValidPhone } from "libphonenumber-js"

/**
 * Validate phone number using libphonenumber-js
 */
export function isValidPhoneNumber(phone: string, country?: string): boolean {
  const num = isValidPhone(phone, country)
  return num.isValid()
}

/**
 * Format phone number to international format
 */
export function formatPhoneInternational(phone: string): string {
  const num = isValidPhone(phone)
  return num.formatInternational()
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneE164(phone: string): string {
  const num = isValidPhone(phone)
  return num.format("E.164")
}

/**
 * Format phone number to national format (Kenya)
 */
export function formatPhoneNational(phone: string): string {
  const num = isValidPhone(phone, "KE")
  return num.formatNational()
}

/**
 * Format phone number to RFC3966 format
 */
export function formatPhoneRFC3966(phone: string): string {
  const num = isValidPhone(phone)
  return num.format("RFC3966")
}

/**
 * Get phone number metadata
 */
export function getPhoneMetadata(phone: string) {
  const num = isValidPhone(phone)
  return {
    country: num.country,
    nationalNumber: num.nationalNumber,
    numberType: num.numberType,
    possible: num.possible,
  }
}

/**
 * Extract country code from phone number
 */
export function extractCountryCode(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "")
  if (cleaned.startsWith("+")) {
    return cleaned.slice(1, 4)
  }
  if (cleaned.startsWith("0")) {
    return "254" // Kenya default
  }
  return "254"
}

/**
 * Convert phone to Kenyan format (0712 345 678)
 */
export function toKenyaFormat(phone: string): string {
  const num = isValidPhone(phone, "KE")
  return num.format("KE")
}

/**
 * Get service provider info (placeholder for future use)
 */
export function getServiceProvider(phone: string): string | null {
  // This would integrate with a carrier lookup API
  // For now, return null
  return null
}