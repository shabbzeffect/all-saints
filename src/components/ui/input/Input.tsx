/* Input.tsx
 * Input component for SaintsHub
 * Provides: Text input, email, password, number types
 * Features: Label integration, placeholder styling, error state, accessibility
 */

import { cn } from "@/lib/config"

interface InputProps extends ReactReact.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "email" | "password" | "number" | "search"
  placeholder?: string
  error?: string | null
  "data-testid"?: string
  className?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>({
  className: "block w-full rounded-md border border-border-dark/30 rounded-md bg-angle dark:bg-angle-dark py-2 px-3 leading-tight text-angle-dark placeholder-angle/40 focus:ring-2 focus:ring-ring focus-ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:text-angle-100 transition-colors appearance-none",
  type: "text",
  ...props,
})

Input.displayName = "Input"