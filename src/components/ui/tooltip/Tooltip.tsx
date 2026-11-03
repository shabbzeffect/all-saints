import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  children: ReactNode
  className?: string
}

export function Tooltip({ children, className }: TooltipProps) {
  return (
    <div
      className={cn(
        "relative inline-block",
        className,
      )}
    >
      {children}
      <div
        className="absolute z-10 invisible opacity-0 duration-200 data-[state=visible]:visible data-[state=visible]:opacity-100 data-[state=hidden]:invisible data-[state=hidden]:opacity-0 data-[side=top]:top-[-4px] data-[side=right]:right-[4px] data-[side=bottom]:bottom-[4px] data-[side=left]:left-[-4px] data-[side=top]:data-[arrow-transform=translateX(-50%)] data-[side=right]:data-[arrow-transform=translateY(-50%)] data-[side=bottom]:data-[arrow-transform=translateX(-50%)] data-[side=left]:data-[arrow-transform=translateX(-50%)] bg-white dark:bg-neutral-800 px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 shadow-xs z-50"
        role="tooltip"
      >
        {children}
      </div>
    </div>
  )
}