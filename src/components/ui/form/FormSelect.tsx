/* FormSelect.tsx
 * Form select component for SaintsHub
 * Provides: Label + Select combination with error state styling
 */

import { cn } from "@/lib/config"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./select/Select"

interface FormSelectProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string | null
  variant?: "default" | "small"
  className?: string
  multiple?: boolean
  disabled?: boolean
}

export function FormSelect({
  label,
  name,
  options,
  placeholder = "Select an option",
  error,
  variant = "default",
  className,
  multiple = false,
  disabled = false,
}: FormSelectProps) {
  const sizeClass = variant === "small" ? "sm" : "default"

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={name}
        className={cn(
          "block text-sm font-medium text-angle-dark dark:text-angle-100",
          variant === "small" && "text-xs",
        )}
      >
        {label}
      </label>
      <Select
        multiple={multiple}
        disabled={disabled}
        name={name}
        className={cn(
          "w-full rounded-md border border-border-dark/30 rounded-md bg-angle dark:bg-angle-dark py-2 px-3 leading-tight text-angle-dark placeholder-angle/40 focus:ring-2 focus:ring-ring focus-ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:text-angle-100",
          error && "border-destructive error",
          error && "focus:ring-destructive",
        )}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className={cn("mt-1 text-sm text-destructive dark:text-destructive-foreground", variant === "small" && "text-xs")}>
          {error}
        </p>
      )}
    </div>
  )
}

FormSelect.displayName = "FormSelect"