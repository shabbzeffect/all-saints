/* errors.ts
 * Error handling utilities for SaintsHub
 * Provides: error formatting, error boundaries, validation errors, API error handling
 */

export type ErrorSeverity = "info" | "warning" | "error" | "critical"

export type ErrorCode =
  | "VALIDATION"
  | "NETWORK"
  | "AUTH"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER"
  | "UNKNOWN"

/**
 * Error response shape from API
 */
export interface ApiError {
  code: ErrorCode
  message: string
  severity: ErrorSeverity
  status?: number
  timestamp: string
  path?: string
  retryable?: boolean
}

/**
 * Create an API error
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  options: {
    status?: number
    path?: string
    severity?: ErrorSeverity
    retryable?: boolean
  } = {}
): ApiError {
  return {
    code,
    message,
    severity: options.severity || "error",
    status: options.status,
    timestamp: new Date().toISOString(),
    path: options.path,
    retryable: options.retryable ?? true,
  }
}

/**
 * Format error for display
 */
export function formatError(error: ApiError): string {
  if (error.severity === "critical") {
    return `⚠️ ${error.message}`
  }
  if (error.severity === "warning") {
    return `⚡ ${error.message}`
  }
  return `❌ ${error.message}`
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: ApiError): boolean {
  return error.retryable !== false
}

/**
 * Determine if error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return error.code === "VALIDATION"
}

/**
 * Determine if error is a not found error
 */
export function isNotFoundError(error: ApiError): boolean {
  return error.code === "NOT_FOUND"
}

/**
 * Determine if error is an auth error
 */
export function isAuthError(error: ApiError): boolean {
  return error.code === "AUTH"
}

/**
 * Wrap fetch with error handling
 */
export async function fetchWithErrorHandling(
  input: RequestInfo,
  init?: RequestInit,
  onError?: (error: ApiError) => void
): Promise<Response> {
  const response = await fetch(input, init)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error: ApiError = {
      code: "NETWORK",
      message: errorData.message || response.statusText,
      severity: "error",
      status: response.status,
      retryable: response.status >= 500,
    }

    if (onError) {
      onError(error)
    }
    throw error
  }

  return response
}

/**
 * Group errors by field
 */
export function groupErrorsByField(
  errors: { field: string; message: string }[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {}

  errors.forEach((err) => {
    if (!grouped[err.field]) {
      grouped[err.field] = []
    }
    grouped[err.field].push(err.message)
  })

  return grouped
}

/**
 * Check if error message contains specific text
 */
export function errorContains(error: ApiError, text: string): boolean {
  return error.message.toLowerCase().includes(text.toLowerCase())
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | ApiError | null
  reset: () => void
}

/**
 * Create initial error boundary state
 */
export function createErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    error: null,
    reset: () => {
      // Reset logic would be handled by the parent component
    },
  }
}