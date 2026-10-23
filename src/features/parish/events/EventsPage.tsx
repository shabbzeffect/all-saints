/* EventsPage.tsx
 * Parish - Events page
 * Provides: Event list, calendar, creation, RSVPs
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "service" | "meeting" | "celebration" | "workshop"
  status: "draft" | "published" | "completed"
  totalSlots: number
  registeredCount: number
}

interface EventsFilter {
  type?: "service" | "meeting" | "celebration" | "workshop"
  status?: "draft" | "published" | "completed"
  searchTerm?: string
}

export function EventsPage() {
  const [filter, setFilter] = useState<EventsFilter>({})
  const [searchTerm, setSearchTerm] = useState("")

  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    fetch(`/api/parish/events${searchTerm ? `?search=${searchTerm}` : ""}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .catch((err) => console.error("Failed to fetch events:", err))
  }, [searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setFilter({ ...filter, searchTerm: e.target.value })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, type: e.target.value as "service" | "meeting" | "celebration" | "workshop" })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, status: e.target.value as "draft" | "published" | "completed" })
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onValueChange={handleSearchChange}
              className="w-full"
            />

            <Select
              onValueChange={handleTypeChange}
              defaultValue=""
              name="type"
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={handleStatusChange}
              defaultValue=""
              name="status"
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableClassName>Event</TableClassName>
                <TableCell>Title</TableCell>
                <TableCell className="text-center">Date</TableCell>
                <TableCell className="text-center">Time</TableCell>
                <TableCell className="text-center">Location</TableCell>
                <TableCell className="text-center">Type</TableCell>
                <TableCell className="text-center">Registered</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  key={event.id}
                  className="hover:bg-angle/5 dark:hover:bg-angle/80"
                >
                  <TableCell>{event.title}</TableCell>
                  <TableCell className="text-center">{event.date}</TableCell>
                  <TableCell className="text-center">{event.time}</TableCell>
                  <TableCell className="text-center">{event.location}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={event.type === "service" ? "default" : event.type === "meeting" ? "secondary" : event.type === "celebration" ? "destructive" : "primary"}
                      size="sm"
                    >
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={event.status === "draft" ? "secondary" : event.status === "published" ? "default" : "destructive"}
                      size="sm"
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div>{event.registeredCount}/{event.totalSlots}</div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="link"
                      className="text-anglican-blue/60 hover:text-anglican-blue text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.13 6.077A2.98 2.98 0 0111 7.937c0 .817-.087 1.615-.243 2.365H4.718a2.984 2.984 0 01-1.934-.955L.094 8.84a2.983 2.983 0 01-.147-.671c0 .337.093.654.287.932l3.446 2.365a2.982 2.982 0 01.073 1.227l1.323-.661a2.98 2.98 0 01-.29 1.109zM11 15a4 4 0 100-8 4 4 0 000 8zM9.855 5.937a1 1 0 011.244 0l.088.011a1 1 0 11.011 1.99l-.088-.011a1 1 0 01-1.244 0l-.088.011  -.117-.056a2.983 2.983 0 01-.198-.548zM15 9.5a5 5 0 11-6.095 2.888L15 9.5zm-6.092 6.317a1 1 0 11-.987-.182l-.177.065.009.152a1 1 0 01-.001.95l.176-.065a1 1 0 01-.986-.182zM5.5 13.5a3 3 0 01-.383-2.35l.818-1.736.766.555.04.011a3 3 0 012.407 2.351l-.818 1.736-.766-.555-.04-.011z" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {events.length === 0 && (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No events found. Create an event first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

EventsPage.displayName = "EventsPage"