// Checkbox.tsx
// Base checkbox component

import { cn } from "@/lib/config"

interface CheckboxProps extends React.SVGProps<SVGSVGElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
}

export const Checkbox = React.forwardRef<SVGSVGElement, CheckboxProps>({
  className: "rounded-sm border border-current [&svg]:pointer-events-none [&]:disabled:cursor-not-allowed [&]:checked:opacity-100 [&]:unchecked:opacity-50",
  checked: false,
  onCheckedChange: () => {},
  disabled: false,
  ...props,
})

Checkbox.displayName = "Checkbox"

export { Checkbox }