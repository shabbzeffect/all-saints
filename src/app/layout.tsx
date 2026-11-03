import "./globals.css"
import { Providers } from "@/components/providers/SessionProvider"

export const metadata = {
  title: "SAINTS",
  description: "School Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}