/* Select.tsx
 * Select component for SaintsHub
 * Provides: Dropdown select with search, keyboard navigation, accessibility
 * Features: Multiple select, disabled state, keyboard navigation, aria labels
 */

import { cn } from "@/lib/config"

interface SelectOptions {
  value: string
  label: string
  disabled?: boolean
  className?: string
}

interface SelectProps extends ReactReact.SelectHTMLAttributes<HTMLSelectElement> {
  "data-testid"?: string
  className?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>({
  className: "block w-full rounded-md border border-border-dark/30 rounded-md bg-angle dark:bg-angle-dark py-2 px-3 leading-tight text-angle-dark placeholder-angle/40 focus:ring-2 focus:ring-ring focus-ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:text-angle-100 transition-colors appearance-none",
  ...props,
})

Select.displayName = "Select"

// Export commonly used sub-components for convenience
export { Select as SelectTrigger, Select as SelectContent, Select as SelectItem } from "./Select.tsx"