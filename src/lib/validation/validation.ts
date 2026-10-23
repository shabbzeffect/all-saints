/* validation.ts
 * Form validation utilities for SaintsHub
 * Provides: field validation, form validation, password strength, email validation
 */

import { isValid as isValidCPF } from "cpf-cnpj-validator"

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate Kenyan phone number format
 */
export function isValidKenyaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "")
  const re = /^(\+254|0)?[17]\d{8}$/
  return re.test(cleaned)
}

/**
 * Validate password strength
 * Returns object with isValid and strength level
 */
export function validatePassword(password: string): {
  isValid: boolean
  strength: "weak" | "medium" | "strong"
  requirements: string[]
} {
  const requirements: string[] = []
  let strength = "weak"

  if (password.length >= 8) {
    requirements.push("Minimum 8 characters")
    strength = "medium"
  } else {
    requirements.push("At least 8 characters")
    return { isValid: false, strength, requirements }
  }

  if /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    requirements.push("Mixed case, numbers and special characters")
    strength = "strong"
  }

  const isValid = strength !== "weak"
  return { isValid, strength, requirements }
}

/**
 * Validate Kenyan ID number (NIDA)
 */
export function isValidKenyaId(id: string): boolean {
  const cleaned = id.replace(/\s+/g, "")
  // Kenyan ID is 8 digits
  const re = /^\d{8}$/
  return re.test(cleaned)
}

/**
 * Validate KES currency amount
 */
export function isValidCurrency(amount: string | number): boolean {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return !isNaN(num) && num >= 0
}

/**
 * Format phone number to Kenya format
 */
export function formatKenyaPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+254/, "0")

  if (cleaned.startsWith("0")) {
    const digits = cleaned.slice(1)
    if (digits.length === 9) {
      const code = digits.slice(0, 3)
      const rest = digits.slice(3)
      return `0${code} ${rest.slice(0, 3)}${rest.slice(3)}`
    }
  }

  return phone
}

/**
 * Parse phone number and extract country code
 */
export function parsePhoneNumber(phone: string): {
  countryCode: string
  nationalNumber: string
  formatted: string
} {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+/, "")
  let countryCode = "254"
  let nationalNumber = cleaned

  if (cleaned.startsWith("254")) {
    countryCode = "254"
    nationalNumber = cleaned.slice(3)
  } else if (cleaned.startsWith("0")) {
    countryCode = "254"
    nationalNumber = cleaned.slice(1)
  }

  const formatted = formatKenyaPhone(phone)

  return { countryCode, nationalNumber, formatted }
}