// Textarea.tsx
// Base textarea component

import React from "react"
import { cn } from "@/lib/config"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "outline" | "underlined"
  error?: boolean
  disabled?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, variant = "default", error = false, disabled = false, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:disabled",
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"
