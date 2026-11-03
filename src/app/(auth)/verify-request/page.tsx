"use client"

import { Button } from "@/components/ui"

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">SaintsHub</h1>
        <p className="text-muted-foreground text-sm mb-8">All Saints Mushililie Management Platform</p>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm">
            We've sent a sign-in link to your email address. Please check your inbox and click the link to sign in.
          </p>
        </div>

        <Button className="w-full" onClick={() => window.history.back()}>
          Go Back
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          SaintsHub v0.1.0 · All Saints Mushililie
        </p>
      </div>
    </div>
  )
}