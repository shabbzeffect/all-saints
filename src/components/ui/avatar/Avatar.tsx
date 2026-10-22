// Avatar.tsx
// Base avatar component

import { cn } from "@/lib/config"

interface AvatarProps extends React.SVGProps<SVGSVGElement> {
  size?: "default" | "sm" | "lg" | "xl"
  children?: React.ReactNode
  className?: string
}

export const Avatar = React.forwardRef<SVGSVGElement, AvatarProps>({
  className: "relative flex h-10 w-10 rounded-full overflow-hidden flex-shrink-0 [&>circle]:opacity-80 [&>circle]:transition-opacity",
  size: "default",
  children: "U",
  ...props,
})

Avatar.displayName = "Avatar"

export { Avatar }