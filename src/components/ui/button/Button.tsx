/* Button.tsx
 * Base button component for SaintsHub
 * Variants: default, primary, secondary, destructive, ghost, outline
 * Sizes: default, sm, lg, icon
 * Features: loading state, full accessibility support
 */

import { cn } from "@/lib/config"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "destructive" | "ghost" | "outline"
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
}

const sizes = {
  default: "h-10 px-4 py-2 text-sm font-medium",
  sm: "h-9 px-3 py-1.5 text-sm font-medium",
  lg: "h-12 px-6 py-3 text-lg font-medium",
  icon: "h-10 w-10 p-0",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>({
  className: "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none [variant:default]:[variant:primary:bg-primary]:[variant:primary:text-primary-foreground]:[variant:secondary:bg-secondary]:[variant:secondary:text-secondary-foreground]:[variant:destructive:bg-destructive]:[variant:destructive:text-destructive-foreground]:[variant:ghost]:[variant:outline:bg-transparent:outline-2:outline-solid:outline-border [variant:outline:hover:bg-accent:outline:text-accent-foreground]",
  variant: "default",
  size: "default",
  asChild: false,
  disabled: false,
  loading: false,
  ...props,
})

Button.displayName = "Button"

export { Button }