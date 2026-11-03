/* Input.tsx
 * Input component for SaintsHub
 * Provides: Text input, email, password, number types
 * Features: Label integration, placeholder styling, error state, accessibility
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
      "block w-full rounded-md border border-border-dark/30 rounded-md bg-angle dark:bg-angle-dark py-2 px-3 leading-tight text-angle-dark placeholder-angle/40 focus:ring-2 focus:ring-ring focus-ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:text-angle-100 transition-colors appearance-none",
      error && "border-destructive focus:ring-destructive",
      className
    )}
    data-testid={dataTestId}
    {...props}
  />
))

Input.displayName = "Input"