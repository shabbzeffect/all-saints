/* phone.ts
 * Phone number utilities for SaintsHub
 * Provides: validation, formatting, parsing for Kenya and regional numbers
 */

import isValidPhone from "libphonenumber-js"

export function isValidPhoneNumber(phone: string, country?: string): boolean {
  const num = isValidPhone(phone, country as any)
  return num ? num.isValid() : false
}

export function formatPhoneInternational(phone: string): string {
  const num = isValidPhone(phone)
  if (!num) return phone
  return num.formatInternational()
}

export function formatPhoneE164(phone: string): string {
  const num = isValidPhone(phone)
  if (!num) return phone
  return num.format("E.164")
}

export function formatPhoneNational(phone: string): string {
  const num = isValidPhone(phone, "KE")
  if (!num) return phone
  return num.formatNational()
}

export function formatPhoneRFC3966(phone: string): string {
  const num = isValidPhone(phone)
  if (!num) return phone
  return num.format("RFC3966")
}

export function getPhoneMetadata(phone: string) {
  const num = isValidPhone(phone)
  if (!num) return { country: null, nationalNumber: null, numberType: null, possible: false }
  return {
    country: num.country,
    nationalNumber: num.nationalNumber,
    numberType: (num as any).numberType,
    possible: (num as any).isPossible(),
  }
}
