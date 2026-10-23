/* FormField.tsx
 * Form field component for SaintsHub
 * Provides: Label + Input combination with error state styling
 */

import { cn } from "@/lib/config"
import { Input } from "./input/Input"

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  error?: string | null
  variant?: "default" | "small"
  className?: string
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  error,
  variant = "default",
  className,
}: FormFieldProps) {
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
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-border-dark/30 rounded-md bg-angle dark:bg-angle-dark py-2 px-3 leading-tight text-angle-dark placeholder-angle/40 focus:ring-2 focus:ring-ring focus-ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:text-angle-100",
          error && "border-destructive error",
          error && "focus:ring-destructive",
        )}
        onChange={(e) => e.target.dispatchEvent(new Event("update:value"))}
      />
      {error && (
        <p className={cn("mt-1 text-sm text-destructive dark:text-destructive-foreground", variant === "small" && "text-xs")}>
          {error}
        </p>
      )}
    </div>
  )
}

FormField.displayName = "FormField"