/* Alert - SaintsHub
Provides: Success, error, and info message alerts
*/
import { cn } from "@/lib/config"

interface AlertProps {
  variant?: "default" | "destructive" | "secondary" | "outline"
  className?: string
}

export function Alert({
  variant = "default",
  className,
}: AlertProps) {
  const variants = {
    default: "bg-angle/5 text-angle dark:bg-angle/80",
    destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
    secondary: "bg-angle/5 text-angle dark:bg-angle/80",
    outline: "border border-angle/50 text-angle dark:border-angle/20 dark:text-angle",
  }

  return (
    <div
      className={cn(
        "rounded-md p-4 mb-4",
        variants[variant],
        className
      )}
    />
  )
}

/* Alert with title */
export function AlertWithTitle({
  title,
  description,
  variant = "default",
  className,
}: {
  title: string
  description: string
  variant?: "default" | "destructive" | "secondary" | "outline"
  className?: string
}) {
  return (
    <div className={cn("rounded-md p-4 mb-4", {
      "border-l-4": variant === "destructive",
    })}>      
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm/60">{description}</p>
    </div>
  )
}