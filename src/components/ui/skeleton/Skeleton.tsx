/* Skeleton Loader - SaintsHub
 * Loading placeholders for cards, tables, avatars and buttons
 */
import { cn } from "@/lib/config"

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn("animate-pulse rounded-md bg-muted", className)}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return <Skeleton className={cn("h-28 w-full rounded-xl", className)} />
}

export function SkeletonTableRow({ cells = 4, className }: { cells?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 py-2", className)}>
      {Array.from({ length: cells }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ className, size = "h-9 w-9" }: { className?: string; size?: string }) {
  return <Skeleton className={cn("rounded-full", size, className)} />
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-full rounded-md", className)} />
}
