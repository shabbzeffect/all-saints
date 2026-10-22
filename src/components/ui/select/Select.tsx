// Select.tsx
// Base select component with dropdown

import { cn } from "@/lib/config"

interface SelectProps extends React.HTMLAttributes<HTMLSelectElement> {
  disabled?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>({
  className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:disabled",
  disabled: false,
  ...props,
})

Select.displayName = "Select"

export { Select }