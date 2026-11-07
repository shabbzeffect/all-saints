"use client";
/* Login Page - SaintsHub
Provides: Email/Password login, SMS OTP, TOTP 2FA setup, Google OAuth
*/
import { cn } from "@/lib/config";
import { Input, Button } from "@/components/ui";
import { useState } from "react";
// ðŸŸ¢ FIXED IMPORTS: Use next-auth/react for client side actions
import { signIn } from "next-auth/react";
import { initiateEmailLoginFlow, verifyLoginOTPAction } from "./actions";
import { useRouter } from "next/navigation";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (showOTP && otp) {
        const isValid = await verifyLoginOTPAction(email, otp);
        if (!isValid) {
          setOtp("");
          setErrorMessage("Invalid OTP code. Please check and try again.");
          setLoading(false);
          return;
        }
        setOtpVerified(true);

        // ðŸŸ¢ FIXED: Using next-auth/react client signIn wrapper clears the context scope crash
        const signInResult = await signIn("credentials", {
          email,
          password,
          otp,
          redirect: false,
        });

        if (signInResult?.error) {
          setErrorMessage(signInResult.error);
          setLoading(false);
          return;
        }

        router.push("/exec");
        return;
      }

      const result = await initiateEmailLoginFlow(email, "KE");

      if (result?.success) {
        setOtpSent(true);
        setShowOTP(true);
        setOtp("");
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(
        error?.message || "An unexpected error occurred during login.",
      );
      setLoading(false);
    }
  };

  const otpForm = (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Enter OTP sent to your registered phone matching {email}
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

      {errorMessage && (
        <p className="text-sm font-medium text-red-500">{errorMessage}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </form>
  );

  const passwordForm = (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
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
        <label className="block text-sm font-medium mb-2">Password</label>
        <Input
          type="password"
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {errorMessage && (
        <p className="text-sm font-medium text-red-500">{errorMessage}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 flex justify-center"
        >
          {loading ? "Requesting OTP..." : "Sign In"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">SaintsHub</h1>
          <p className="text-muted-foreground text-sm">
            All Saints Mushililie Management Platform
          </p>
        </div>

        {showOTP && otpSent ? otpForm : passwordForm}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/exec" })}
            className="flex-1 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Continue with Google
          </button>

          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <button
              type="button"
              onClick={() => router.push("/exec")}
              className="flex-1 rounded-md border border-input px-3 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              Demo Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
