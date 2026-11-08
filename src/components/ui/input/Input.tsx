"use client"

/* Input.tsx
 * Input component for SaintsHub
 * Provides: Text input, email, password, number types
 * Features: Label integration, placeholder styling, error state, accessibility
 * NOTE: This component uses React hooks and must be a Client Component
 */

import React from "react"
import { cn } from "@/lib/config"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "email" | "password" | "number" | "search" | "date" | "tel"
  placeholder?: string
  error?: string | null
  "data-testid"?: string
  className?: string
  placeholderClassName?: string
  onValueChange?: (value: string) => void
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = "text",
  placeholder,
  error,
  "data-testid": dataTestId,
  placeholderClassName,
  onValueChange,
  ...props
}, ref) => (
  <input
    ref={ref}
    type={type}
    placeholder={placeholder}
    onChange={(e) => onValueChange?.(e.target.value) || props.onChange?.(e)}
    className={cn(
      "block w-full rounded-md border border-input bg-background py-2 px-3 leading-tight text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-[#d9a441] focus-visible:ring-2 focus-visible:ring-[#d9a441]/40 disabled:opacity-50 disabled:pointer-events-none appearance-none",
      error && "border-destructive focus-visible:ring-destructive",
      className
    )}
    data-testid={dataTestId}
    {...props}
  />
))

Input.displayName = "Input"