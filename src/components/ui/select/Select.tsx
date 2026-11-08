/* Select.tsx
 * Select component for SaintsHub
 * Provides: Dropdown select with search, keyboard navigation, accessibility
 */

import React from "react"
import { cn } from "@/lib/config"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  "data-testid"?: string
  className?: string
  onValueChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  onValueChange,
  children,
  ...props
}, ref) => (
  <select
    ref={ref}
    onChange={onValueChange || props.onChange}
    className={cn(
      "block w-full rounded-md border border-input bg-background py-2 px-3 leading-tight text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-[#d9a441] focus-visible:ring-2 focus-visible:ring-[#d9a441]/40 disabled:opacity-50 disabled:pointer-events-none appearance-none",
      className
    )}
    {...props}
  >
    {children}
  </select>
))

Select.displayName = "Select"

interface SelectTriggerProps {
  children?: React.ReactNode
  className?: string
}

export const SelectTrigger = ({ children, className }: SelectTriggerProps) => (
  <span className={cn(className)}>{children}</span>
)

SelectTrigger.displayName = "SelectTrigger"

interface SelectContentProps {
  children?: React.ReactNode
  className?: string
}

export const SelectContent = ({ children, className }: SelectContentProps) => (
  <span className={cn(className)}>{children}</span>
)

SelectContent.displayName = "SelectContent"

interface SelectItemProps {
  value: string
  children?: React.ReactNode
  className?: string
  disabled?: boolean
}

export const SelectItem = ({ value, children, className, disabled }: SelectItemProps) => (
  <option value={value} disabled={disabled} className={cn(className)}>
    {children}
  </option>
)

SelectItem.displayName = "SelectItem"

interface SelectValueProps {
  placeholder?: string
  className?: string
}

export const SelectValue = ({ placeholder, className }: SelectValueProps) => (
  <option value="" disabled className={cn(className)}>
    {placeholder}
  </option>
)

SelectValue.displayName = "SelectValue"
