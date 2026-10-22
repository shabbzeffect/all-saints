/* Onboarding Page - SaintsHub
Provides: Institution selection (School | Parish), role selection, initial setup
*/
import { cn } from "@/lib/config"
import { Input, Button } from "@/components/ui"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wing } from "@prisma/client"

export function OnboardingPage() {
  const [wing, setWing] = useState<"school" | "parish" | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const router = useRouter()

  const handleContinue = async () => {
    if (!wing || !selectedRole) return

    // Create user session with wing and role
    // In production, this would create the user in auth
    // and set the institution context

    // For now, just navigate to the appropriate dashboard
    if (wing === "school") {
      router.push("/app/exec?institution=school")
    } else if (wing === "parish") {
      router.push("/app/exec?institution=parish")
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Welcome to SaintsHub
        </h1>

        {/* Institution Selection */}
        <div className="mb-6 p-6 rounded-xl border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Select Your Institution
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWing("school")}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-colors",
                wing === "school" && "border-primary bg-primary/5 text-primary"
              )}
              >
                <GraduationCap className="h-6 w-6" />
                <span>School</span>
                <span className="text-xs">All Saints Mushililie Academy</span>
              </button>

            <button
              onClick={() => setWing("parish")}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/10 transition-colors",
                wing === "parish" && "border-secondary bg-secondary/5 text-secondary"
              )}
              >
                <BuildingHouse className="h-6 w-6" />
                <span>Parish</span>
                <span className="text-xs">ACK Mushililie Parish</span>
              </button>
            </div>
          </div>

          {wing && (
            <p className="mt-4 text-sm text-muted-foreground">
              You selected: <strong className="text-foreground">{wing === "school" ? "School" : "Parish"}</strong>
            </p>
          )}
        </div>

        {/* Role Selection */}
        {wing && (
          <div className="mb-6 p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Select Your Role
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* School roles */}
              {wing === "school" && (
                <>
                  <button
                    onClick={() => setSelectedRole("SCHOOL_PRINCIPAL")}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                      selectedRole === "SCHOOL_PRINCIPAL" && "border-primary bg-primary/5 text-primary"
                    )}
                  >
                    <Users className="h-6 w-6" />
                    <span>Principal</span>
                  </button>

                  <button
                    onClick={() => setSelectedRole("SCHOOL_BURSAR")}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                      selectedRole === "SCHOOL_BURSAR" && "border-primary bg-primary/5 text-primary"
                    )}
                  >
                    <Heart className="h-6 w-6" />
                    <span>Bursar</span>
                  </button>

                  <button
                    onClick={() => setSelectedRole("SCHOOL_TEACHER")}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                      selectedRole === "SCHOOL_TEACHER" && "border-primary bg-primary/5 text-primary"
                    )}
                  >
                    <GraduationCap className="h-6 w-6" />
                    <span>Teacher</span>
                  </button>
                </>
              )}

              {/* Parish roles */}
              {wing === "parish" && (
                <>
                  <button
                    onClick={() => setSelectedRole("PARISH_PRIEST")}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                      selectedRole === "PARISH_PRIEST" && "border-primary bg-primary/5 text-primary"
                    )}
                  >
                    <Users className="h-6 w-6" />
                    <span>Priest</span>
                  </button>

                  <button
                    onClick={() => setSelectedRole("PARISH_TREASURER")}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                      selectedRole === "PARISH_TREASURER" && "border-primary bg-primary/5 text-primary"
                    )}
                  >
                    <Heart className="h-6 w-6" />
                    <span>Treasurer</span>
                  </button>

                  <button
                    onClick={() => setSelectedRole("PARISH_SECRETARY")}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                      selectedRole === "PARISH_SECRETARY" && "border-primary bg-primary/5 text-primary"
                    )}
                  >
                    <BuildingHouse className="h-6 w-6" />
                    <span>Secretary</span>
                  </button>
                </>
              )}

              {/* Shared roles */}
              {wing === "school" || wing === "parish" && (
                <button
                  onClick={() => setSelectedRole("SUPER_ADMIN")}
                  className={cn(
                    "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                    selectedRole === "SUPER_ADMIN" && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Shield className="h-6 w-6" />
                  <span>Super Admin</span>
                </button>
              )}

              <button
                onClick={() => setSelectedRole("IT_ADMIN")}
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors",
                  selectedRole === "IT_ADMIN" && "border-primary bg-primary/5 text-primary"
                )}
              >
                <Users2 className="h-6 w-6" />
                <span>IT Admin</span>
              </button>
            </div>

            {selectedRole && (
              <p className="mt-4 text-sm text-muted-foreground">
                You are: <strong className="text-foreground">{selectedRole}</strong>
              </p>
            )}
          </div>
        )}

        {/* Continue Button */}
        {wing && selectedRole && (
          <Button
            onClick={handleContinue}
            disabled={!!router.isReady}
            className="w-full py-3 px-4 mt-6 text-lg font-medium"
          >
            Continue to Dashboard
          </Button>
        )}

        {/* Quick links / info */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            SaintsHub is a unified management platform for All Saints Mushililie Academy
            and ACK Mushililie Parish Church. Your data is strictly separated by institution.
          </p>
        </div>
      </div>
    </div>
  )
}