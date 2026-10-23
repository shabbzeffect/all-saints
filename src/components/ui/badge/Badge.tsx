/* Badge.tsx
 * Badge component for SaintsHub
 * Variants: default, primary, secondary, destructive, ghost, link
 * Sizes: sm, default, lg
 */

import { cn } from "@/lib/config"

interface BadgeProps extends ReactReact.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "destructive" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
  asChild?: boolean
}

const badgeVariants = {
  default: "bg-angle text-angle/foreground",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "underline-offset-4 hover:underline text-anglican-blue/60 hover:text-anglican-blue dark:hover:text-anglican-blue-100",
}

const badgeSizes = {
  default: "inline-flex items-center rounded-md border border-border-dark/30 rounded-md px-3 py-1.5 text-xs font-medium",
  sm: "inline-flex items-center rounded-md border border-border-dark/30 rounded-md px-2.5 py-0.5 text-xs font-medium",
  lg: "inline-flex items-center rounded-md border border-border-dark/30 rounded-md px-4 py-2 text-sm font-medium",
}

export const Badge = React.forwardRef<HTMLButtonElement, BadgeProps>({
  className: "inline-flex items-center rounded-md",
  variant: "default",
  size: "default",
  asChild: false,
  ...props,
})

Badge.displayName = "Badge"

export { Badge }