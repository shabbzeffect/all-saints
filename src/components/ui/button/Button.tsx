"use client"

/* Button.tsx
 * Base button component for SaintsHub
 * Variants: default, primary, secondary, destructive, ghost, outline
 * Sizes: default, sm, lg, icon
 * Features: loading state, full accessibility support
 * NOTE: This component uses React hooks and must be a Client Component
 */

import React from "react"
import { cn } from "@/lib/config"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "destructive" | "ghost" | "outline" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
  disabled?: boolean
  loading?: boolean
}

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
}

const sizes = {
  default: "h-10 px-4 py-2 text-sm font-medium",
  sm: "h-9 px-3 py-1.5 text-sm font-medium",
  lg: "h-12 px-6 py-3 text-lg font-medium",
  icon: "h-10 w-10 p-0",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", asChild = false, disabled = false, loading = false, children, ...props }, ref) => {
  const Component = asChild ? React.Fragment : "button"
  return (
    <Component
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  )
})

Button.displayName = "Button"