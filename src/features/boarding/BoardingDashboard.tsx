/* Boarding Dashboard - SaintsHub School Portal
Provides: Overview of all dormitories, occupancy, fees
*/
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Dormitory {
  id: string
  name: string
  type: "BOYS" | "GIRLS" | "MIXED"
  wing: "SCHOOL" | "PARISH"
  capacity: number
  currentOccupancy: number
  isActive: boolean
}

interface BoardingDashboardProps {
  dormitories: Dormitory[]
}

export function BoardingDashboard({ dormitories }: BoardingDashboardProps) {
  const [fees, setFees] = useState<any[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    // Fetch boarding fees
    fetch("/api/boarding/fees?wing=SCHOOL", { cache: "no-store" }).then(
      (res) => res.json().then((d) => setFees(d.data || []))
    )
  }, [searchParams])

  const totalCapacity = dormitories.reduce((sum, d) => sum + d.capacity, 0)
  const totalOccupancy = dormitories.reduce((sum, d) => sum + d.currentOccupancy, 0)
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-blue dark:text-anglican-blue-100">
          Boarding Dashboard
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          Dormitory management & occupancy overview
        </p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-angle/5 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
              </svg>
            </div>
            <div>
              <p className="text-anglican-blue font-medium text-sm">Total Students</p>
              <p className="text-3xl font-bold text-anglican-blue">
                {totalOccupancy}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-angle/5 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
              </svg>
            </div>
            <div>
              <p className="text-anglican-blue font-medium text-sm">Total Capacity</p>
              <p className="text-3xl font-bold">
                {totalCapacity}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-angle/5 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
              </svg>
            </div>
            <div>
              <p className="text-anglican-blue font-medium text-sm">Occupancy Rate</p>
              <p className="text-2xl font-bold {overallOccupancyRate >= 80 ? "text-danger" : overallOccupancyRate >= 50 ? "text-warning" : "text-success"}">
                {overallOccupancyRate}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border border-border-dark/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-angle/5 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
              </svg>
            </div>
            <div>
              <p className="text-anglican-blue font-medium text-sm">Active Dormitories</p>
              <p className="text-3xl font-bold">
                {dormitories.filter((d) => d.isActive).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dormitories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dormitories</CardTitle>
        </CardHeader>
        <CardContent>
          {dormitories.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No dormitories found. Add a dormitory first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Dormitory</TableClassName>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Capacity</TableCell>
                  <TableCell className="text-center">Occupied</TableCell>
                  <TableCell className="text-center">Rate</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dormitories.map((dorm) => (
                  <TableRow
                    key={dorm.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{dorm.name}</div>
                      <div className="text-xs text-muted/60">{dorm.wing} wing</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="default"
                        size="sm"
                      >
                        {dorm.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={dorm.currentOccupancy >= dorm.capacity ? "destructive" : "default"}
                        size="sm"
                      >
                        {dorm.currentOccupancy}/{dorm.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={overallOccupancyRate >= 80 ? "destructive" : overallOccupancyRate >= 50 ? "warning" : "default"}
                        size="sm"
                      >
                        {overallOccupancyRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                        aria="View dormitory details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}