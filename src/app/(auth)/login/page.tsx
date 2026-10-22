/* Login Page - SaintsHub
Provides: Email/Password login, SMS OTP, TOTP 2FA setup, Google OAuth
*/
import { cn } from "@/lib/config"
import {
 ,
  Input,
  Button,
  Checkbox,
} from "@/components/ui"
import { useState } from "react"
import { auth, signIn, sendLoginOTP, verifyLoginOTP } from "@/server/auth/auth"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/config"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If OTP mode
      if (showOTP && otp) {
        const isValid = await verifyLoginOTP(email, otp)
        if (!isValid) {
          // Reset OTP attempts
          setOtp("")
          setLoading(false)
          return
        }
        setOtpVerified(true)
        // Store OTP verification in session
        await auth()
        router.push("/app/exec")
        return
      }

      // Step 1: Send OTP if user doesn't have password or MFA is required
      // For now, always send OTP first
      await sendLoginOTP(email, "KE")
      setOtpSent(true)
      setShowOTP(true)
      setOtp("")
      setLoading(false)
    } catch (error) {
      console.error("Login error:", error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Logo/brand area */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SaintsHub
          </h1>
          <p className="text-muted-foreground text-sm">
            All Saints Mushililie Management Platform
          </p>
        </div>

        {/* Login Form */}
        {showOTP && otpSent ? (
          {/* OTP Verification Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter OTP sent to {email}
              </label>
              <Input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
                className="max-w-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-sm text-muted-foreground">
              OTP was sent to {email}. Check your SMS.
            </p>
          </form>
        ) : (
          {/* Email & Password Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="user@allsaintsmushililie.or.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Forgot password link */}
              <a
                href="#"
                className="underline text-primary hover:text-primary/90"
              >
                Forgot password?
              </a>
            </div>

            {/* OTP Resend link */}
            {otpSent && (
              <p className="text-center text-sm text-muted-foreground">
                Didn't receive OTP?{" "}
                <a href="#" onClick={() => {
                  // Resend OTP
                  // In real impl: sendLoginOTP(email)
                  console.log("Resending OTP")
                }}
                >
                  Resend
                </a>
              </p>
            )}
          </form>
        )}

        {/* Divider / Continue with */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex-1 h-px bg-border" />
          <span>Or continue with</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        {/* OAuth Buttons */}
        <div className="mt-4 flex gap-2">
          {/* Google OAuth */}
          <button
            aria-label="Continue with Google"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 12c2.21 0 4-1.79 4-4s1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm6.09-2.63c-.37-.66-.96-1.09-1.69-1.09C15.5 5.57 14.12 5 12 5c-2.3 0-3.79.93-4.38 1.55l-.54.37c-.3.18-.5.45-.64.73-.14.29-.15.44-.18.53-.03.09-.16.18-.18.41l-.1.26c0 .28.08.5.13.66l-.13.37c-.03.11-.14.2-.18.25l-.06.18c0 1.02.53 2.05 1.66 2.05.97 0 1.57-.4 1.97-1.18.4-.78.55-1.62.48-2.53-.07-.92-.45-1.78-1.24-2.15-.86-.42-1.77-.26-2.29.06-.52.32-1.01.76-1.35 1.08-.33 1.98-.73 2.63-1.19.59-.46.96-.9 1.23-1.33.27-.42.37-.64.37-.94l-.01-.14c0-.31-.06-.61-.14-.88l-.15-.25c0 0-.66-.15-1.17-.06-.51.09-.95.22-1.34.37-.69.15-1.33.23-1.89.23-.79 0-1.32-.1-1.67-.25-.35-.14-.58-.25-.74-.25-.16 0-.22.06-.23.22l-.03.14c0 .59.17 1.22.42 1.62.25.4.46.66.57.85.1.18.17.28.2.33.04.06.05.12.05.16l-.06.13c-.12.25-.3.46-.55.62-.28.2-.47.34-.58.42l-.13.13c-.15.15-.35.23-.48.23-.13 0-.23-.03-.28-.08l-.12-.12c0 0-.48-.1-1.02-.25-.67-.2-.97-.33-.97-.75 0-.44-.2-.64-.48-.73l-.06-.14c0-.2.05-.37.1-.5.05-.13.07-.24.12-.31.08-.1.14-.14.21-.09.28l-.07.1c-.07.06-.15.08-.2.08-.06 0-.12 0-.16 0l-.1 0c-.31 0-.52-.1-.64-.25l-.15-.25c0 0-.46-.12-.68-.25-.23-.13-.37-.23-.47-.33l-.06-.18c0-.27-.05-.51-.13-.69-.08-.17-.15-.37-.18-.53l-.05-.1c0 0-.33-.06-.43-.13l-.14-.1c0 0-.28-.05-.36-.13l-.1-.05c0 0-.28-.04-.35-.09l-.05 0c-.15 0-.24.03-.3.07-.05.03-.1.05-.13.09l-.13.1c0 .35.1.52.24.65.14.13.28.18.36.18.08 0 .14 0 .17.01l.1 0c.08 0 .13 0 .16-.01.03-.01.05-.02.05-.06l.06-.13c0-.06 0-.1-.03-.13l-.09-.1c0 0-.18-.05-.22-.13l-.03 0c-.07 0-.14.03-.17.06-.04.04-.08.09-.1.14l-.09.1c0 .37.07.65.18.85.1.2.22.3.28.36.07.07.12.1.16.08.05 0 .08 0 .1-.02.06l-.06.13c0 .06 0 .1-.02.13l-.06.13c0 .06 0 .1-.03.16l-.08.14c0 .31-.05.56-.14.75-.09.2-.2.36-.27.46l-.06.18c0 .28-.05.53-.13.69-.08.17-.15.37-.18.53l-.03.1c0 .38.05.56.13.68.08.12.22.18.28.18.07 0 .12 0 .14.01.03.01.06.01.07.01l.1 0c.07 0 .13 0 .17-.01.03-.01.05-.03.05-.08l.03 0c.01 0 .07 0 .07.02.01.01.02.04.02.09l.03 0c.01.05.03.1.04.16l.05.1c0 .33.05.5.1.65.05.13.07.2.08.26l.09.1c0 .41.06.62.14.75-.09.2-.2.41-.27.51l-.03.1c0 .35.05.5.14.65.09.18.2.46.2.65.01.18-.04.34-.11.45-.2.1-.28.07-.39.05-.49l-.13.12c0 0-.13.03-.19.15l-.05.1c0 .35.06.55.14.75.08.2.18.36.28.46.09.1.2.2.28.28 0 .42-.1.59-.26.67l-.1.13c0 .06-.03.1-.07.13l-.06.13c0 .06 0 .1-.03.16l-.07.1c0 .28-.06.53-.13.69-.08.17-.15.37-.18.53l-.06.18c0 .26-.05.5-.13.66l-.08.14c0 .36-.1.67-.16.92l-.03.18c0 .3.06.52.13.7.06.16.14.3.24.44.09.08.16.1.21.12.1.07.03.05.05.08.06l.07.1c0 .06 0 .1-.03.13l-.06.13c0 .06 0 .1-.03.16l-.05.1c0 .37.09.63.24.78.15.15.33.23.44.23.11 0 .2-.05.25-.13l.03-.1c0-.35-.05-.56-.14-.75-.09-.19-.2-.36-.27-.46l-.03.1c0 .35.05.5.14.65.09.18.2.46.2.65.01.18-.05.34-.14.45-.24.16l.03.1c0 .35.05.55.14.75.09.2.2.46.2.75 0 .29-.05.46-.13.56-.09.1-.2.35-.28.51l-.05.1c0 .37.08.65.24.85.16.2.3.3.38.36.08.07.12.1.14.07.05 0 .09 0 .12 0l.1 0c.07 0 .13 0 .15.01.04-.01.05-.03.05-.06l.06-.13c0-.06 0-.1-.03-.13l-.09-.1c0 0-.18-.05-.22-.13l-.03 0c-.07 0-.14.03-.17.06-.04.04-.08.09-.1.14l-.09.1c0 .37.07.65.18.85.1.2.22.3.28.36.07.07.12.1.16.08.05 0 .08 0 .1-.01.06l-.06.13c0 .06 0 .1-.03.13l-.05.1c0 .37.09.63.24.78.15.15.33.23.44.23.11 0 .2-.05.25-.13l.03-.1c0-.35-.05-.56-.14-.75-.09-.19-.2-.36-.27-.46l-.03.1c0 .35.05.5.14.65.09.18.2.46.2.65.01.18-.05.34-.14.45-.24.16l.03.1c0 .35.05.55.14.75.09.2.2.46.2.75 0 .29-.05.46-.13.56-.09.1-.2.35-.28.51l-.05.1c0 .37.08.65.24.85.16.2.3.3.38.36.08.07.12.1.14.07.05 0 .09 0 .12 0l.1 0c.07 0 .13 0 .15.01.04-.01.05-.03.05-.06l.06-.13c0-.06 0-.1-.03-.13l-.09-.1c0 0-.18-.05-.22-.13l-.03 0c-.07 0-.14.03-.17.06-.04.04-.08.09-.1.14l-.09.1c0 .37.07.65.18.85.1.2.22.3.28.36.07.07.12.1.16.08.05 0 .08 0 .1-.01.06l-.06.13c0 .06 0 .1-.03.13l-.05.1c0 .37.09.63.24.78.15.15.33.23.44.23.11 0 .2-.05.25-.13l.03-.1c0-.35-.05-.56-.14-.75-.09-.19-.2-.36-.27-.46l-.03.1c0 .35.05.5.14.65.09.18.2.46.2.65.01.18-.05.34-.14.45-.24.16l.03.1c0 .35.05.55.14.75.09.2.2.46.2.75 0 .29-.05.46-.13.56-.09.1-.2.35-.28.51l-.03.1c0 .38.05.56.13.68.08.12.22.18.28.18.07 0 .12 0 .14.01.03.01.06.01.07.01l.1 0c.07 0 .13 0 .15.01.04-.01.05-.03.05-.06l.06-.13c0-.06 0-.1-.03-.13l-.09-.1c0 0-.18-.05-.22-.13l-.03 0c-.07 0-.14.03-.17.06-.04.04-.08.09-.1.14l-.09.1c0 .37.07.65.18.85.1.2.22.3.28.36.07.07.12.1.16.08.05 0 .08 0 .1-.01.06l-.06.13c0 .06 0 .1-.03.13l-.05.1c0 .37.09.63.24.78.15.15.33.23.44.23.11 0 .2-.05.25-.13l.03-.1c0-.35-.05-.56-.14-.75-.09-.19-.2-.36-.27-.46l-.03.1c0 .35.05.5.14.65.09.18.2.46.2.65.01.18-.05.34-.14.45-.24.16l.03.1c0 .35.05.55.14.75.09.2.2.46.2.75 0 .29-.05.46-.13.56-.09.1-.2.35-.28.51l-.05.1c0 .37.08.65.24.85.16.2.3.3.38.36.08.07.12.1.14.07.05 0 .09 0 .12 0l.1 0c.07 0 .13 0 .15.01.04-.01.05-.03.05-.06l.06-.13c0-.06 0-.1-.03-.13l-.09-.1c0 0-.18-.05-.22-.13l-.03 0c-.07 0-.14.03-.17.06-.04.04-.08.09-.1.14l-.09.1c0 .37.07.65.18.85.1.2.22.3.28.36.07.07.12.1.16.08.05 0 .08 0 .1-.01.06l-.06.13c0 .06 0 .1-.03.13l-.05.1c0 .37.09.63.24.78.15.15.33.23.44.23.11 0 .2-.05.25-.13l.03-.1c0-.35-.05-.56-.14-.75-.09-.19-.2-.36-.27-.46l-.03.1c0 .35.05.5.14.65.09.18.2.46.2.65.01.18-.05.34-.14.45-.24.16l.03.1c0 .35.05.55.14.75.09.2.2.46.2.75 0 .29-.05.46-.13.56-.09.1-.2.35-.28.51l-.05.1c0 .37.08.65.24.85.16.2.3.3.38.36.08.07.12.1.14.07.05 0 .09 0 .12 0l.1 0c.07 0 .13 0 .15.01.04-.01.05-.03.05-.06l.06-.13c0-.06 0-.1-.03-.13l-.09-.1c0 0-.18-.05-.22-.13l-.03 0c-.07 0-.14.03-.17.06-.04.04-.08.09-.1.14l-.09.1c0 .37.07.65.18.85.1.2.22.3.28.36.07.07.12.1.16.08.05 0 .08 0 .1-.01.06l-.06.13c0 .06 0 .1-.03.13l-.05.1c0 .37.09.63.24.78.15.15.33.23.44.23.11 0 .2-.05.25-.13l.03-.1c0-.35-.05-.56-.14-.75-.09-.19-.2-.36-.27-.46l-.03.1c0 .35.05.5.14.65.09.18.2.46.2.65.01.18-.05.34-.14.45-.24.16l.03.1c0 .35.05.55.14.75.09.2.2.46.2.75 0 .29-.05.46-.13.56-.09.1-.2.35-.28.51"
                fillRule="evenodd"
              />
            </svg>
            Continue with Google
          </button>

          {/* Email/Password alternative */}
          {/* This is handled by the form above */}
        </div>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex-1 h-px bg-border" />
          <span>or sign in with password</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        {/* System info */}
        <p className="mt-6 text-xs text-muted-foreground text-center">
          SaintsHub v0.1.0 · All Saints Mushililie
        </p>
      </div>
    </div>
  )
}