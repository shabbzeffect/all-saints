// Textarea.tsx
// Base textarea component

import { cn } from "@/lib/config"

interface TextareaProps extends React.TextareaAttributes<HTMLTextAreaElement> {
  variant?: "default" | "outline" | "underlined"
  error?: boolean
  disabled?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>({
  className: "flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:disabled [variant:default]:[variant:outline]:[border-2]:[border-border]:[bg-transparent]:[p-0]:[pr-3]:[py-2]:[text-sm]:[placeholder:text-muted-foreground]:[focus-visible:ring-2]:[focus-visible:ring-ring]:[focus-visible:ring-offset-2]",
  variant: "default",
  error: false,
  disabled: false,
  ...props,
})

Textarea.displayName = "Textarea"

export { Textarea }