/* Login Page - SaintsHub
Provides: Email/Password login, SMS OTP, TOTP 2FA setup, Google OAuth
"use client"
*/
import { cn } from "@/lib/config"
import {
  Input,
  Button,
  Checkbox,
} from "@/components/ui"
import { useState } from "react"
import { auth, signIn, sendLoginOTP, verifyLoginOTP } from "@/server/auth/auth"
import { useRouter } from "next/navigation"

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
      if (showOTP && otp) {
        const isValid = await verifyLoginOTP(email, otp)
        if (!isValid) {
          setOtp("")
          setLoading(false)
          return
        }
        setOtpVerified(true)
        await auth()
        router.push("/app/exec")
        return
      }

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

  const otpForm = (
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
  )

  const passwordForm = (
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

        <a
          href="#"
          className="underline text-primary hover:text-primary/90"
        >
          Forgot password?
        </a>
      </div>

      {otpSent && (
        <p className="text-center text-sm text-muted-foreground">
          Didn't receive OTP?{" "}
          <a href="#" onClick={() => {
            console.log("Resending OTP")
          }}
          >
            Resend
          </a>
        </p>
      )}
    </form>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SaintsHub
          </h1>
          <p className="text-muted-foreground text-sm">
            All Saints Mushililie Management Platform
          </p>
        </div>

        {showOTP && otpSent ? otpForm : passwordForm}

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex-1 h-px bg-border" />
          <span>Or continue with</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            aria-label="Continue with Google"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            Continue with Google
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex-1 h-px bg-border" />
          <span>or sign in with password</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          SaintsHub v0.1.0 · All Saints Mushililie
        </p>
      </div>
    </div>
  )
}

export default LoginPage
