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
        "flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-[#d9a441] focus-visible:ring-2 focus-visible:ring-[#d9a441]/40 disabled:opacity-50",
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"
