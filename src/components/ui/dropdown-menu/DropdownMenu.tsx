import { ReactNode, useState } from "react"
import { cn } from "@/lib/utils"

export interface DropdownMenuProps {
  children: ReactNode
  className?: string
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      {children}
    </div>
  )
}

DropdownMenu.Items = function DropdownMenuItems({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <ul
      className={cn(
        "absolute z-10 w-44 mt-1 origin-bottom-right rounded-md bg-white dark:bg-neutral-800 py-1 text-sm shadow-lg ring-1 ring-black ring-offset-neutral-900/50 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-80 data-[state=open]:focus-visible:ring-2 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    >
      {children}
    </ul>
  )
}

DropdownMenu.Button = function DropdownMenuButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <button
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-colors bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700",
        className,
      )}
    >
      {children}
    </button>
  )
}