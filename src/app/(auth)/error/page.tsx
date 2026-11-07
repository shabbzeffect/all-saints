"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui"
import Link from "next/link"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    OAuthSignin: "Error starting OAuth sign-in process.",
    OAuthCallback: "Error completing OAuth sign-in. Please try again.",
    OAuthCreateAccount: "Could not create OAuth account.",
    EmailCreateAccount: "Could not create email account.",
    Callback: "Error in OAuth callback handler.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    EmailSignin: "Error sending email sign-in link.",
    Default: "An authentication error occurred. Please try again.",
  }

  const message = errorMessages[error || "Default"] || errorMessages.Default

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">SaintsHub</h1>
          <p className="text-muted-foreground text-sm">All Saints Mushililie Management Platform</p>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Authentication Error</h2>
          </div>
          <p className="text-destructive text-sm">{message}</p>
        </div>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Link href="/login" className="block text-center">
            <Button variant="outline" className="w-full">
              Return to Login
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          SaintsHub v0.1.0 · All Saints Mushililie
        </p>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  )
}