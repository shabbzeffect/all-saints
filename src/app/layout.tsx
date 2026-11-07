import "./globals.css"
import type { Metadata } from "next"
import { Providers } from "@/components/providers/SessionProvider"

export const metadata: Metadata = {
  title: "SaintsHub — All Saints Mushililie",
  description: "All Saints Mushililie School & Parish Management Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
