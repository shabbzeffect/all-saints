"use client"

// Checkbox.tsx
// Base checkbox component
// NOTE: This component uses React hooks and must be a Client Component

import React from "react"
import { cn } from "@/lib/config"

interface CheckboxProps extends React.SVGProps<SVGSVGElement> {
  isChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export const Checkbox = React.forwardRef<SVGSVGElement, CheckboxProps>(({ className, isChecked = false, onCheckedChange, disabled = false, children, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      className={cn(
        "rounded-sm border border-current [&svg]:pointer-events-none [&]:disabled:cursor-not-allowed [&]:checked:opacity-100 [&]:unchecked:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </svg>
  )
})

Checkbox.displayName = "Checkbox"
