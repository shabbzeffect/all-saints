/* RoomAssignmentManager - SaintsHub Boarding Module
 * Assign students to dormitory rooms and view current assignments
 */
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/config"
import { useState, useEffect, useCallback } from "react"

interface Room {
  id: string
  roomNumber: string
  dormitoryName?: string
  dormitory?: { name: string }
  capacity?: number
}

interface CurrentAssignment {
  id: string
  studentId?: string
  studentName?: string
  studentAdmission?: string
  roomNumber?: string
  dormitoryName?: string
  room?: { roomNumber?: string; dormitory?: { name?: string } }
  leaseStart?: string
  leaseEnd?: string
  rentAmount?: number
}

export function RoomAssignmentManager() {
  const [assignments, setAssignments] = useState<CurrentAssignment[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const [studentName, setStudentName] = useState("")
  const [roomId, setRoomId] = useState("")
  const [leaseStart, setLeaseStart] = useState(() => new Date().toISOString().slice(0, 10))
  const [leaseEnd, setLeaseEnd] = useState("")
  const [rentAmount, setRentAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [assignRes, roomRes] = await Promise.all([
        fetch("/api/boarding/assignments/current", { cache: "no-store" }),
        fetch("/api/boarding/rooms", { cache: "no-store" }),
      ])
      const assignBody = await assignRes.json().catch(() => null)
      const roomBody = await roomRes.json().catch(() => null)
      setAssignments(assignBody?.data ?? [])
      setRooms(roomBody?.data ?? roomBody?.rooms ?? [])
    } catch {
      setAssignments([])
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!roomId) {
      setMessage("Select a room first.")
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/boarding/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, roomId, leaseStart, leaseEnd, rentAmount: Number(rentAmount) || 0 }),
      })
      setMessage(res.ok ? "Student assigned to room." : "Could not assign student.")
      if (res.ok) {
        setStudentName("")
        setRoomId("")
        setLeaseEnd("")
        setRentAmount("")
        fetchAll()
      }
    } catch {
      setMessage("Could not assign student.")
    } finally {
      setSubmitting(false)
    }
  }

  const roomLabel = (room: Room) => {
    const dorm = room.dormitoryName ?? room.dormitory?.name
    return dorm ? `${room.roomNumber} — ${dorm}` : room.roomNumber
  }

  const assignmentRoom = (a: CurrentAssignment) => a.roomNumber ?? a.room?.roomNumber ?? "—"
  const assignmentDorm = (a: CurrentAssignment) => a.dormitoryName ?? a.room?.dormitory?.name ?? "—"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Room Assignments</h2>
        <p className="text-sm text-muted-foreground">Assign boarders to rooms and track leases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign Student to Room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="studentName" className="mb-1 block text-xs font-medium text-muted-foreground">Student Name</label>
              <Input id="studentName" name="studentName" value={studentName} onValueChange={setStudentName} placeholder="Full name" required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="room" className="mb-1 block text-xs font-medium text-muted-foreground">Room</label>
              <Select onValueChange={(e) => setRoomId(e.target.value)} defaultValue="" name="room">
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {rooms.length === 0 && <SelectItem value="">No rooms available</SelectItem>}
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>{roomLabel(room)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="leaseStart" className="mb-1 block text-xs font-medium text-muted-foreground">Lease Start</label>
              <Input id="leaseStart" name="leaseStart" type="date" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="leaseEnd" className="mb-1 block text-xs font-medium text-muted-foreground">Lease End</label>
              <Input id="leaseEnd" name="leaseEnd" type="date" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rentAmount" className="mb-1 block text-xs font-medium text-muted-foreground">Boarding Fee (KES / term)</label>
              <Input id="rentAmount" name="rentAmount" type="number" min={0} value={rentAmount} onValueChange={setRentAmount} placeholder="e.g. 50000" />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={submitting} loading={submitting}>
                {submitting ? "Assigning…" : "Assign Student"}
              </Button>
              {message && <p className="ml-3 self-center text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Room</TableHead>
                <TableHead className="text-center">Dormitory</TableHead>
                <TableHead className="text-center">Lease Period</TableHead>
                <TableHead className="text-right">Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="font-medium">{assignment.studentName ?? assignment.studentId}</div>
                    {assignment.studentAdmission && <div className="text-xs text-muted-foreground">{assignment.studentAdmission}</div>}
                  </TableCell>
                  <TableCell className="text-center">{assignmentRoom(assignment)}</TableCell>
                  <TableCell className="text-center">{assignmentDorm(assignment)}</TableCell>
                  <TableCell className="text-center text-sm">{assignment.leaseStart} → {assignment.leaseEnd ?? "Open"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {assignment.rentAmount != null ? formatCurrency(assignment.rentAmount) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && assignments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No current assignments.</p>
          )}
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading assignments…</p>}
        </CardContent>
      </Card>
    </div>
  )
}
