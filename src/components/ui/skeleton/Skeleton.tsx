/* Skeleton Loader - SaintsHub
Provides: Loading placeholders for cards, tables, and content sections
*/
import { cn } from "@/lib/config"

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  radius?: number
  classNames?: {
    base?: string
    ring?: string
  }
}

export function Skeleton({
  className,
  width = "100%",
  height = "1rem",
  radius = "0.5rem",
  classNames: { base = "animate-bounce bg-border/50 rounded", ring = "" },
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-border/50 rounded",
        "animate-bounce",
        radius !== null && `rounded-${radius}`,
        width && `w-${width}`,
        height && `h-${height}`,
        className,
        ring
      )}
    />
  )
}

/* Variants for different skeleton types */
export function SkeletonCard({
  className,
  width = "full",
  height = "1.25rem",
}: {
  className?: string
  width?: string
  height?: string
}) {
  return <Skeleton className={className} width={width} height={height} radius="lg" />
}

export function SkeletonTableRow({
  className,
  cells = 3,
}: {
  className?: string
  cells?: number
}) {
  const cellHeights = ["0.875rem", "1rem", "1.125rem"]
  return (
    <div className={cn("flex", "items-start", className)}>
      {Array.from({ length: cells }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1",
            "h-",
            cellHeights[i % cellHeights.length],
            "rounded-md",
            "bg-border/50"
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({
  className,
  size = "sm",
}: {
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizes = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" }
  return (
    <div
      className={cn(
        "rounded-full",
        "bg-border/50",
        sizes[size],
        className
      )}
    />
  )
}

export function SkeletonButton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "h-10 w-full",
        "rounded-md",
        "bg-border/50",
        "animate-bounce",
        className
      )}
    />
  )
}