/* useForm.tsx
 * Form hook for SaintsHub
 * Provides: form state management, validation, and submit handling
 */

import { useState, useCallback } from "react"

interface FormField {
  value: string
  touched: boolean
  error: string | null
}

interface UseFormOptions {
  onSubmit?: (data: Record<string, string>) => void
  onSuccess?: () => void
  onError?: (errors: Record<string, string>) => void
}

/**
 * Form hook with state management and validation
 */
export function useForm(
  initialData: Record<string, string>,
  options: UseFormOptions = {}
) {
  const [fields, setFields] = useState<Record<string, FormField>>(
    Object.fromEntries(
      Object.keys(initialData).map(key => [key, { value: initialData[key], touched: false, error: null }])
    )
  )
  const [submitted, setSubmitted] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFields((prev) => ({
      ...prev,
      [name]: { value, touched: prev[name]?.touched || false, error: prev[name]?.error },
    }))
  }, [])

  const blurHandler = useCallback((name: string) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], touched: true },
    }))
  }, [])

  const reset = useCallback(() => {
    setFields(
      Object.fromEntries(
        Object.keys(initialData).map(key => [key, { value: initialData[key], touched: false, error: null }])
      )
    )
    setSubmitted(false)
  }, [initialData])

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitted(true)

      const errors: Record<string, string> = {}
      let hasError = false

      Object.keys(fields).forEach((key) => {
        const field = fields[key]
        if (field.touched && !field.value.trim()) {
          errors[key] = "This field is required"
          hasError = true
        }
      })

      if (hasError) {
        if (options.onError) {
          options.onError(errors)
        }
        return
      }

      const data: Record<string, string> = {}
      Object.keys(fields).forEach((key) => {
        data[key] = fields[key].value
      })

      if (options.onSubmit) {
        options.onSubmit(data)
      } else {
        // Default submit behavior
        window.alert("Form submitted successfully")
      }

      if (options.onSuccess) {
        options.onSuccess()
      }
    },
    [fields, options]
  )

  return {
    fields,
    submitted,
    handleChange,
    blurHandler,
    reset,
    submit,
    setFieldValue: (name: string, value: string) =>
      setFields((prev) => ({
        ...prev,
        [name]: { value, touched: prev[name]?.touched || false, error: prev[name]?.error },
      })),
    setFieldTouched: (name: string, touched: boolean) =>
      setFields((prev) => ({
        ...prev,
        [name]: { ...prev[name], touched },
      })),
    setFieldError: (name: string, error: string | null) =>
      setFields((prev) => ({
        ...prev,
        [name]: { ...prev[name], error },
      })),
  }
}

/**
 * Validate a form field against rules
 */
export function validateField(
  value: string,
  rules: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp }
): string | null {
  if (rules.required && (!value || value.trim() === "")) {
    return "This field is required"
  }
  if (value && rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`
  }
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`
  }
  if (value && rules.pattern && !rules.pattern.test(value)) {
    return rules.pattern.message || "Invalid format"
  }
  return null
}

/**
 * Validate entire form
 */
export function validateForm(
  data: Record<string, string>,
  rules: Record<string, { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp }>
): Record<string, string> {
  const errors: Record<string, string> = {}

  Object.keys(rules).forEach((key) => {
    const error = validateField(data[key], rules[key])
    if (error) {
      errors[key] = error
    }
  })

  return errors
}