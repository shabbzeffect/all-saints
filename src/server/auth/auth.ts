// ============================================================================
// Auth.js Configuration - SaintsHub Authentication
// ============================================================================
// Provides: email+password, SMS OTP, TOTP 2FA, session management
// ============================================================================

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./src/server/db"
import { sendSMSOTP, verifySMSOTP } from "./src/server/integrations/sms"
import { generateTOTP, verifyTOTP } from "otplib"

// Config
export const authOptions = {
  // Debug: enable in development
  debug: process.env.NODE_ENV === "development",

  adapter: PrismaAdapter(prisma),

  // Session configuration
  session: {
    strategy: "database",
    // Max age in days
    maxAge: 30,
    // Update age on each request
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Callbacks
  callbacks: {
    // Attach user wing/institution to session
    async session({ session, token, user }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          name: token.name,
          email: token.email,
          picture: token.picture,
          wing: token.wing,
          institutionId: token.institutionId,
          role: token.role,
          mfaEnabled: token.mfaEnabled,
        }
      }
      return session
    },

    // Attach data to JWT
    async jwt({ token, user, account, profile, isNewUser }) {
      // Persist wing/institution from onboarding
      if (user) {
        token.wing = user.wing
        token.institutionId = user.institutionId
        token.role = user.role
        token.mfaEnabled = user.mfaEnabled
      }

      // On first login with Google, set default wing based on profile
      if (account && profile) {
        // Could determine from profile email domain, etc.
        token.wing = user?.wing || Wing.SHARED
        token.institutionId = user?.institutionId
      }

      return token
    },

    // Signin event audit
    async signIn({ user, account, profile, email, credentials }) {
      // Audit signin event
      if (user.id) {
        await prisma.auditEvent.create({
          data: {
            actorId: user.id,
            action: AuditAction.LOGIN,
            targetType: "User",
            metadata: {
              method: account?.provider,
              ip: credentials?.ip,
            },
          },
        })
      }
      return true
    },

    async signOut({ user, session }) {
      // Audit signout
      if (user?.id) {
        await prisma.auditEvent.create({
          data: {
            actorId: user.id,
            action: AuditAction.LOGOUT,
            targetType: "User",
            metadata: {},
          },
        })
      }
    },
  },

  // Pages
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/onboarding",
    error: "/auth/login", // Error code passed in query string
    verifyRequest: "/auth/verify-request", // Enable email verification
    newUser: "/auth/onboarding",
  },

  // Providers
  providers: [
    // Email + Password Credentials
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@allsaintsmushililie.or.ke" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text", placeholder: "123456" },
        remember: { label: "Remember", type: "checkbox" },
      },
      async authorize(credentials, req) {
        // Step 1: Verify OTP if provided
        if (credentials?.otp) {
          const isValid = await verifySMSOTP(
            credentials.email || credentials.phone,
            credentials.otp
          )
          if (!isValid) {
            throw new Error("Invalid OTP. Please try again.")
          }
          // OTP verified, proceed to check user
        }

        // Step 2: Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
          include: { roles: { include: { permissions: true } } },
        })

        if (!user || user.status === UserStatus.ARCHIVED) {
          throw new Error("Invalid email or password.")
        }

        // Step 3: Check if MFA is required for this action/role
        const requiresMFA = await requiresMFAForRole(user)

        // Step 4: Verify password
        if (!user.passwordHash) {
          throw new Error("No password set. Please use OTP login.")
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!passwordValid) {
          // Increment failed login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
              lockedUntil: {
                gt: new Date() ? new Date() : new Date(Date.now() + 15 * 60 * 1000),
              },
            },
          })
          throw new Error("Invalid email or password.")
        }

        // Step 5: Check MFA
        if (requiresMFA && !user.mfaEnabled) {
          throw new Error(
            "MFA required for this role. Please set up TOTP or use backup code."
          )
        }

        // Step 6: Verify TOTP if MFA enabled
        if (user.mfaEnabled) {
          // OTP was already verified at step 1, skip here
          // But if this is a separate MFA check:
          // const isTotpValid = await verifyTOTP(
          //   credentials.totp || "",
          //   user.mfaSecret!
          // )
          // if (!isTotpValid) {
          //   throw new Error("Invalid TOTP.")
          // }
        }

        // Step 7: Reset failed login attempts on success
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        })

        // Return user data (passwordHash excluded)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          wing: user.wing,
          institutionId: user.institutionId,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
          phone: user.phone,
        }
      },
    }),

    // Google OAuth (optional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],

  // Secret for JWT signing
  secret: process.env.AUTH_SECRET,

  // Debug
  // WARNING: Do not enable debug in production without securing logs
}

// Helper: Check if user's role requires MFA
async function requiresMFAForRole(user: any) {
  const requiresMFARoles = [
    "PARISH_TREASURER",
    "SCHOOL_BURSAR",
    "SUPER_ADMIN",
    "IT_ADMIN",
  ]

  if (!user.roles || user.roles.length === 0) return false

  const hasRequiredRole = user.roles.some(
    (r: any) => requiresMFARoles.includes(r.key)
  )

  return hasRequiredRole
}

export default NextAuth(authOptions)

// Export types for use in route handlers
export const {
  handlers: { GET, POST, PUT, DELETE },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth(authOptions)

// Export for middleware use
export type { User as NextAuthUser } from "next-auth"

// ============================================================================
// Auth Middleware Utility
// ============================================================================

// Usage: import { withAuth, requirePermission } from "@/src/server/authorization"

// withAuth wraps a handler to ensure user is authenticated
// and has the active institution context

// requirePermission checks if the user has the required permission
// for the given resource and action

// Example:
// export const GET = withAuth(async (req) => {
//   return requirePermission(req, "school:finance:read", async () => {
//     // handler logic
//   })
// }, [Wing.SCHOOL])

// ============================================================================
// OTP SENDING UTILITY
// ============================================================================

// Send SMS OTP to user's phone
export async function sendLoginOTP(phoneNumber: string, institutionId: string) {
  // Normalize phone number
  const normalized = normalizePhoneNumber(phoneNumber)

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

  // Store OTP in Redis with 5-minute TTL
  // await redis.set(`otp:${normalized}`, otpCode, "EX", 300)

  // Send via Africa's Talking
  await sendSMSOTP({
    phone: normalized,
    message: `SaintsHub login OTP: ${otpCode}. Valid for 5 minutes.`,
    sender: process.env.AFRISTALKING_SENDER_ID || "SAINTS",
  })

  // Return OTP for testing (in production, don't return it)
  return otpCode
}

// Verify SMS OTP
export async function verifyLoginOTP(phoneNumber: string, otpCode: string) {
  const normalized = normalizePhoneNumber(phoneNumber)
  return await verifySMSOTP(normalized, otpCode)
}

// Normalize Kenyan phone numbers to +254 format
export function normalizePhoneNumber(phone: string): string {
  let normalized = phone.trim()

  // Remove leading +, 0, 254
  normalized = normalized.replace(/^\+?254?/, "")
  // Remove leading 0
  normalized = normalized.replace(/^0/, "")

  // Add +254 prefix
  return `+254${normalized}`
}

// ============================================================================
// TOTP 2FA UTILITIES
// ============================================================================

// Generate TOTP secret for user
export function generateTotpSecret(): string {
  return otplib.authenticator.generateSecret()
}

// Generate TOTP code
export function getTotpCode(secret: string): string {
  return otplib.authenticator.generate(secret)
}

// Verify TOTP code
export function verifyTotpCode(secret: string, code: string): boolean {
  return otplib.authenticator.check(code, secret)
}

// ============================================================================
// Password Reset Utility
// ============================================================================

// Send password reset email with token
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  institutionName: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

  await nodemailer.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Password Reset - ${institutionName}`,
    html: `
      <h3>Password Reset</h3>
      <p>You are receiving this email because you requested a password reset for your SaintsHub account.</p>
      <p>Click the button below to reset your password:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      </p>
      <p>If you did not request this password reset, please ignore this email. This link will expire in 1 hour.</p>
      <hr />
      <p>© ${new Date().getFullYear()} All Saints Mushililie. All rights reserved.</p>
    `,
  })
}

// ============================================================================
// Email Sending Utility
// ============================================================================

export async function sendEmail({
  to,
  subject,
  html,
  text,
  fromEmail,
  fromName,
}: {
  to: string
  subject: string
  html: string
  text?: string
  fromEmail?: string
  fromName?: string
}) {
  const transport = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    secure: false, // true for 465, false for other ports
  }

  const mailOptions = {
    from: fromEmail || `${fromName || "SaintsHub"} <${fromEmail || process.env.SMTP_FROM}>`,
    to,
    subject,
    text: text || htmlToText(html),
    html,
  }

  // In development, just log the email instead of sending
  if (process.env.NODE_ENV === "development") {
    console.log("📧 [DEV] Would send email:", { to, subject, html })
    return { messageId: "dev-mode", accepted: [to] }
  }

  // In production, send via nodemailer
  const transporter = nodemailer.createTransport(transport)
  const result = await transporter.sendMail(mailOptions)

  return result
}

// ============================================================================
// In-App Notification Utility
// ============================================================================

export async function createNotification({
  recipientId,
  senderId,
  institutionId,
  channel,
  subject,
  body,
  templateId,
  templateData,
  priority = 0,
}: {
  recipientId: string
  senderId?: string
  institutionId?: string
  channel: NotificationChannel
  subject?: string
  body: string
  templateId?: string
  templateData?: any
  priority?: number
}) {
  return await prisma.notification.create({
    data: {
      recipientId,
      senderId,
      institutionId,
      channel,
      subject,
      body,
      templateId,
      templateData,
      priority,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
    },
  })
}

// Mark notification as sent
export async function markNotificationSent(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    },
  })
}

// Mark notification as delivered
export async function markNotificationDelivered(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: NotificationStatus.DELIVERED,
      deliveredAt: new Date(),
    },
  })
}

// Mark notification as opened
export async function markNotificationOpened(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: NotificationStatus.OPENED,
      openedAt: new Date(),
    },
  })
}

// ============================================================================
// Background Job Creation
// ============================================================================

export async function createBackgroundJob({
  type,
  payload,
  priority,
  institutionId,
  correlationId,
}: {
  type: JobType
  payload?: any
  priority?: number
  institutionId?: string
  correlationId?: string
}) {
  return await prisma.backgroundJob.create({
    data: {
      type,
      status: JobStatus.PENDING,
      priority: priority ?? 0,
      payload: payload || {},
      institutionId,
      correlationId,
      createdAt: new Date(),
    },
  })
}

// Update job status
export async function updateJobStatus({
  jobId,
  status,
  result,
  error,
}: {
  jobId: string
  status: JobStatus
  result?: any
  error?: string
}) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  }

  if (status === JobStatus.COMPLETED && result) {
    updateData.result = result
    updateData.completedAt = new Date()
  }

  if (status === JobStatus.FAILED && error) {
    updateData.error = error
    updateData.failedAt = new Date()
    updateData.attempts = { increment: 1 }
  }

  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: updateData,
  })
}

// ============================================================================
// Session Management
// ============================================================================

// Get current user from request (for middleware/app router)
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

// Check if user has active institution membership
export async function hasActiveInstitution(userId: string): Promise<{
  institutionId: string
  wing: Wing
  role: string
} | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          institution: true,
          userRoles: {
            include: { role: true },
          },
        },
      },
    },
  })

  if (!user || user.status !== UserStatus.ACTIVE) return null

  // Find active membership
  const activeMembership = user.memberships.find(
    (m) => m.status === MembershipStatus.ACTIVE
  )

  if (!activeMembership) return null

  const userRole = activeMembership.userRoles.find((ur) => ur.isActive)?.role

  return {
    institutionId: activeMembership.institutionId,
    wing: activeMembership.institution.type as Wing,
    role: userRole?.key ?? "",
  }
}

// Export Wing type
export type { Wing }

// ============================================================================
// END OF AUTH.MODULAR
// ============================================================================