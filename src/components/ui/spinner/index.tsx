/* LoadingSpinner - SaintsHub UI Component
 * Simple loading spinner for async operations
 */

import { cn } from "@/lib/config"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "default" | "lg"
}

export const LoadingSpinner = ({ className, size = "default" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

LoadingSpinner.displayName = "LoadingSpinner"
