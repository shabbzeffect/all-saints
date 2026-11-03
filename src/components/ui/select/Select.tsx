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
      "block w-full rounded-md border border-border-dark/30 rounded-md bg-angle dark:bg-angle-dark py-2 px-3 leading-tight text-angle-dark placeholder-angle/40 focus:ring-2 focus:ring-ring focus-ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:text-angle-100 transition-colors appearance-none",
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
