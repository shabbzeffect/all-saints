/* Table.tsx
 * Base table component for SaintsHub
 * Used across dashboards for displaying structured data
 */

import { cn } from "@/lib/config"

interface TableHeaderProps {
  className?: string
}

interface TableRowProps extends ReactReact.TableRowHTMLAttributes<HTMLTableRowElement> {
  className?: string
}

interface TableCellProps extends ReactReact.TableCellHTMLAttributes<HTMLTableCellElement> {
  className?: string
}

export const TableHeader = ({
  className,
}: TableHeaderProps) => {
  return <thead className={cn("bg-angle/5 dark:bg-angle/20", className)}>
  }

TableHeader.displayName = "TableHeader"

export const TableRow = ({
  className,
  ...props
}: TableRowProps) => {
  return <tr className={cn("border-b angle/10 dark:border-angle/20 hover:bg-angle/5 dark:hover:bg-angle/80", className)} {...props} />
}

TableRow.displayName = "TableRow"

export const TableBody = ({
  className,
}: {
  className?: string
}) => {
  return <tbody className={cn("divide-y angle/10 dark:divide-angle/20", className)} />
}

TableBody.displayName = "TableBody"

export const TableCell = ({
  className,
  ...props
}: TableCellProps) => {
  return <td className={cn("p-2 text-sm select-none", className)} {...props} />
}

TableCell.displayName = "TableCell"

export const Table = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <table className={cn("w-full rounded-md", className)}>{children}</table>
}

Table.displayName = "Table"