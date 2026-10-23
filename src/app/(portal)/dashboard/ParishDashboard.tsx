/* ParishDashboard.tsx
 * Parish portal dashboard - main entry point
 * Provides: Parish operations overview, communications, events, finance
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

export function ParishDashboard() {
  const searchParams = useSearchParams()

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Parish Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
            Parish Dashboard
          </h1>
          <p className="text-muted dark:text-muted-foreground mt-1">
            SaintsHub Parish - Communications, Events & Finance
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats cards would be populated from API */}
      </div>

      {/* Communications Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Communications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted dark:text-muted-foreground">
            No communications yet. Send a message to get started.
          </p>
        </CardContent>
      </Card>

      {/* Events Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted dark:text-muted-foreground">
            No upcoming events. Create an event to get started.
          </p>
        </CardContent>
      </Card>

      {/* Finance Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Finance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted dark:text-muted-foreground">
            Parish financial data would appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

ParishDashboard.displayName = "ParishDashboard"