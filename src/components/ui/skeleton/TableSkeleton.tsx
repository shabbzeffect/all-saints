/* TableSkeleton - table-shaped loading placeholder
 * Renders N rows of cell bars inside the same grid shape as its sibling table
 */
import { Skeleton } from "./Skeleton"

export function TableSkeleton({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={className ?? "py-4"} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border/60 py-3 last:border-0">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-4 ${i === 0 ? "w-28" : "flex-1"} ${i === columns - 1 && columns > 3 ? "ml-auto w-20" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
