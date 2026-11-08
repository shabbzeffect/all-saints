import Link from "next/link"
import { BedDouble, Wallet, DoorOpen, KeyRound } from "lucide-react"
import { BoardingDashboard } from "@/features/boarding/BoardingDashboard"

const sections = [
  { title: "Exeat Passes", description: "Approve permission-to-leave requests", href: "/school/boarding/exeat", icon: KeyRound },
  { title: "Room Assignments", description: "Assign boarders to dormitory rooms", href: "/school/boarding/rooms", icon: DoorOpen },
  { title: "Boarding Fees", description: "Billing and payment tracking", href: "/school/boarding/fees", icon: Wallet },
]

export default function BoardingPage() {
  return (
    <div className="space-y-6">
      <BoardingDashboard />
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl border border-border-dark/30 bg-card p-5 transition-colors hover:border-anglican-blue-400 hover:bg-anglican-blue-50/40"
          >
            <section.icon className="h-6 w-6 text-anglican-blue-700 transition-colors group-hover:text-anglican-blue-800" />
            <p className="mt-3 font-semibold">{section.title}</p>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BedDouble className="h-4 w-4" />
        Boarding is available for both school and parish wings.
      </div>
    </div>
  )
}
