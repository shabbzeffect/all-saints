/* Navigation.tsx
 * Main navigation for SaintsHub portal
 * Provides: sidebar navigation for different user roles
 */

import { cn } from "@/lib/config"
import { Menu } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface NavigationProps {
  items: NavItem[]
  onSelect: (href: string) => void
  activeHref: string
  hasChildren?: boolean
}

export const Navigation = ({
  items,
  onSelect,
  activeHref,
  hasChildren = false,
}: NavigationProps) => {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = item.href === activeHref
        const isDisabled = item.disabled

        return (
          <button
            key={item.href}
            onClick={() => !isDisabled && onSelect(item.href)}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ",
              isActive ? "bg-angle/5 text-anglican-blue dark:bg-angle/20 dark:text-anglican-blue-100" : "text-muted hover:text-anglican-blue dark:hover:text-anglican-blue-100",
              isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon
              className={cn(
                "shrink-0 w-5 h-5",
                isActive ? "text-anglican-blue dark:text-anglican-blue-100" : "text-muted/60 dark:text-muted-foreground/60"
              )}
            />{item.title}
          </button>
        )
      })}
    </nav>
  )
}

Navigation.displayName = "Navigation"

/**
 * Default navigation items for parent portal
 */
export const parentNavItems: NavItem[] = [
  { title: "Dashboard", href: "/parent", icon: () => <Menu className="size-4" />, disabled: false },
  { title: "Children", href: "/parent/children", icon: undefined, disabled: false },
  { title: "Fee Payments", href: "/parent/pay-fees", icon: undefined, disabled: false },
  { title: "Receipts", href: "/parent/receipts", icon: undefined, disabled: false },
  { title: "Report Cards", href: "/parent/report-cards", icon: undefined, disabled: false },
]

/**
 * Default navigation items for school portal
 */
export const schoolNavItems: NavItem[] = [
  { title: "Dashboard", href: "/school", icon: () => <Menu className="size-4" />, disabled: false },
  { title: "Academics", href: "/school/academics", icon: undefined, disabled: false },
  { title: "Finance", href: "/school/finance", icon: undefined, disabled: false },
  { title: "Students", href: "/school/students", icon: undefined, disabled: false },
  { title: "Guardians", href: "/school/guardians", icon: undefined, disabled: false },
  { title: "Attendance", href: "/school/attendance", icon: undefined, disabled: false },
]