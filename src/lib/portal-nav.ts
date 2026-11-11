/* Shared portal navigation model — sidebar and ⌘K palette */
import {
  Bell,
  BookOpen,
  Bus,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  BarChart3,
  Church,
  Contact,
  CreditCard,
  FileText,
  Files,
  GraduationCap,
  Home,
  Landmark,
  Megaphone,
  Receipt,
  School,
  ShieldCheck,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  Banknote,
  KeyRound,
  BedDouble,
  LibraryBig,
  LayoutDashboard,
} from "lucide-react"

export interface NavLink {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavSection {
  label: string
  links: NavLink[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    links: [
      { title: "Executive", href: "/exec", icon: LayoutDashboard },
      { title: "Statistics", href: "/statistics", icon: BarChart3 },
    ],
  },
  {
    label: "School",
    links: [
      { title: "Dashboard", href: "/school", icon: School },
      { title: "Students", href: "/school/students", icon: GraduationCap },
      { title: "Admissions", href: "/school/admissions", icon: UserPlus },
      { title: "Attendance", href: "/school/attendance", icon: CalendarCheck },
      { title: "Academics", href: "/school/academics", icon: BookOpen },
      { title: "Finance", href: "/school/finance", icon: Wallet },
      { title: "Guardians", href: "/school/guardians", icon: ShieldCheck },
      { title: "Boarding", href: "/school/boarding", icon: BedDouble },
      { title: "Transport", href: "/school/transport", icon: Bus },
    ],
  },
  {
    label: "Parish",
    links: [
      { title: "Dashboard", href: "/parish", icon: Church },
      { title: "Members", href: "/parish/members", icon: Users },
      { title: "Groups", href: "/parish/groups", icon: UsersRound },
      { title: "Events", href: "/parish/events", icon: CalendarDays },
      { title: "Communications", href: "/parish/communications", icon: Megaphone },
      { title: "Finance", href: "/parish/finance", icon: Landmark },
    ],
  },
  {
    label: "Parent",
    links: [
      { title: "Dashboard", href: "/parent", icon: Home },
      { title: "Pay Fees", href: "/parent/pay-fees", icon: CreditCard },
      { title: "Receipts", href: "/parent/receipts", icon: Receipt },
      { title: "Report Cards", href: "/parent/report-cards", icon: FileText },
      { title: "Boarding", href: "/parent/boarding", icon: BedDouble },
      { title: "Transport", href: "/parent/transport", icon: Bus },
      { title: "Library", href: "/parent/library", icon: LibraryBig },
    ],
  },
  {
    label: "People & HR",
    links: [
      { title: "HR Dashboard", href: "/hr", icon: Contact },
      { title: "Staff Directory", href: "/hr/staff", icon: Users },
      { title: "Leave Management", href: "/hr/leave", icon: CalendarOff },
      { title: "Payroll", href: "/hr/payroll", icon: Calculator },
      { title: "Bank Details", href: "/hr/bank-details", icon: Building2 },
      { title: "My Payslips", href: "/hr/my-payslips", icon: Receipt },
    ],
  },
  {
    label: "Library",
    links: [{ title: "Library Desk", href: "/library", icon: LibraryBig }],
  },
  {
    label: "Administration",
    links: [
      { title: "Documents", href: "/admin/documents", icon: Files },
      { title: "Notifications", href: "/admin/notifications", icon: Bell },
      { title: "Payments", href: "/admin/payments", icon: Banknote },
      { title: "Roles & Access", href: "/admin/roles", icon: KeyRound },
    ],
  },
]

const EXACT_ROUTES = new Set(["/school", "/parish", "/parent", "/hr", "/library"])

export function isActive(pathname: string, href: string) {
  if (pathname === href) return true
  if (EXACT_ROUTES.has(href)) return false
  return pathname.startsWith(href + "/")
}

export function pageTitle(pathname: string): string {
  for (const section of NAV_SECTIONS) {
    for (const link of section.links) {
      if (isActive(pathname, link.href)) return link.title
    }
  }
  return "SaintsHub"
}
