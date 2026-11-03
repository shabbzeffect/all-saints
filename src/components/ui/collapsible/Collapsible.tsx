import { ReactNode, useState } from "react"
import { cn } from "@/lib/utils"

export interface CollapsibleProps {
  defaultOpen?: boolean
  className?: string
}

const Collapsible = ({
  defaultOpen = false,
  className,
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("rounded-md border", className)}>
      <div
        role="button"
        aria-controls="collapsible-content"
        aria-expanded={isOpen}
        className={cn(
          "flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-colors bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700",
        )}
      >
        {children}
      </div>
      <div
        id="collapsible-content"
        className={cn(
          "hidden",
          isOpen && "block",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default Collapsible