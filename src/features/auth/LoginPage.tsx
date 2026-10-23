/* LoginPage.tsx
 * Auth - Login page
 * Provides: Login form with email/password, remember me, register link
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/config"

interface LoginForm {
  email: string
  password: string
  remember: boolean
}

export function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // In production, this would call the auth API
    // For now, simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    // Navigate to dashboard
    // window.location.href = "/parent"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      <Card className="w-full max-w-md p-8 sm:p-10">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded dark:bg-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
              className="w-full"
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              className="w-full"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) =>
                    setForm({ ...form, remember: e.target.checked })
                  }
                  className="w-4 h-4 rounded border"
                />
                Remember me
              </label>

              <Button type="submit" disabled={loading} variant="primary">
                {loading ? "Sign in..." : "Sign In"}
              </Button>
            </div>

            <div className="text-center text-sm text-muted/60">
              Don't have an account? <a href="/onboarding" className="underline hover:text-anglican-blue">
                Get started
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

LoginPage.displayName = "LoginPage"