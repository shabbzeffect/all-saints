// Avatar.tsx
// Base avatar component

import React from "react"
import { cn } from "@/lib/config"

interface AvatarProps extends React.SVGProps<SVGSVGElement> {
  size?: "default" | "sm" | "lg" | "xl"
  children?: React.ReactNode
  className?: string
}

export const Avatar = React.forwardRef<SVGSVGElement, AvatarProps>(({ className, size = "default", children = "U", ...props }, ref) => {
  return (
    <svg
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 rounded-full overflow-hidden flex-shrink-0 [&>circle]:opacity-80 [&>circle]:transition-opacity",
        className
      )}
      {...props}
    >
      {children}
    </svg>
  )
})

Avatar.displayName = "Avatar"
