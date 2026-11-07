/* Table.tsx
 * Base table component for SaintsHub
 * Used across dashboards for displaying structured data
 */

import React from "react"
import { cn } from "@/lib/config"

interface TableHeaderProps {
  className?: string
  children?: React.ReactNode
}

interface TableRowProps {
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

interface TableCellProps {
  className?: string
  children?: React.ReactNode
}

export const TableHead = ({ className, children }: TableCellProps) => {
  return <th className={cn("p-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none", className)}>{children}</th>
}

TableHead.displayName = "TableHead"

export const TableHeader = ({ className, children }: TableHeaderProps) => {
  return <thead className={cn("bg-angle/5 dark:bg-angle/20", className)}>{children}</thead>
}

TableHeader.displayName = "TableHeader"

export const TableRow = ({ className, children, onClick, ...props }: TableRowProps) => {
  return (
    <tr className={cn("border-b angle/10 dark:border-angle/20 hover:bg-angle/5 dark:hover:bg-angle/80", className)} {...props} onClick={onClick}>
      {children}
    </tr>
  )
}

TableRow.displayName = "TableRow"

export const TableBody = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return <tbody className={cn("divide-y angle/10 dark:divide-angle/20", className)}>{children}</tbody>
}

TableBody.displayName = "TableBody"

export const TableCell = ({ className, children, ...props }: TableCellProps) => {
  return <td className={cn("p-2 text-sm select-none", className)} {...props}>{children}</td>
}

TableCell.displayName = "TableCell"

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <table className={cn("w-full rounded-md", className)}>{children}</table>
}

Table.displayName = "Table"
