import type { Metadata } from "next"
import { SiteNav } from "@/components/public/SiteNav"
import { SiteFooter } from "@/components/public/SiteFooter"

export const metadata: Metadata = {
  title: "All Saints Mushililie — Anglican Academy & Parish, Kakamega",
  description:
    "An Anglican day and boarding academy in Kakamega County, Kenya — faith formed, minds stretched, character kept. PP1 to Grade 9, CBC curriculum. Book a free school visit.",
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f3ed] font-sans text-[#1f2a44]">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
