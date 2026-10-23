/* Shared Notifications - SaintsHub Platform
Provides: System notifications with status filtering
*/
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP" | "PUSH"
  recipientType: "STAFF" | "PARENTS" | "STUDENTS" | "MEMBERS" | "ALL"
  institutionId?: string
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED"
  sentAt?: string
  deliveredAt?: string
  createdAt: string
  metadata?: {
    read?: boolean
    clicked?: boolean
  }
}

interface NotificationFilter {
  status?: "PENDING" | "SENT" | "DELIVERED" | "FAILED"
  channel?: "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP" | "PUSH"
  recipientType?: "STAFF" | "PARENTS" | "STUDENTS" | "MEMBERS" | "ALL"
  type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  searchTerm?: string
}

export function Notifications() {
  const [filters, setFilters] = useState<NotificationFilter>({
    status: "",
    channel: "",
    recipientType: "",
    type: "",
    searchTerm: "",
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get("status") || ""
    const channel = searchParams.get("channel") || ""
    const recipientType = searchParams.get("recipientType") || ""
    const type = searchParams.get("type") || ""
    setFilters({ status, channel, recipientType, type, searchTerm: searchParams.get("search") || "" })
  }, [searchParams])

  const fetchNotifications = useCallback(async () => {
    const response = await fetch(`/api/shared/notifications${searchParams.toString() ? `&${searchParams.toString()}` : ""}`, {
      cache: "no-store",
    })
    const data = await response.json()
    setNotifications(data.data || [])
  }, [searchParams])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications = notifications.filter((notification) => {
    const matchesStatus = filters.status ? notification.status === filters.status : true
    const matchesChannel = filters.channel ? notification.channel === filters.channel : true
    const matchesRecipientType = filters.recipientType
      ? notification.recipientType === filters.recipientType
      : true
    const matchesType = filters.type ? notification.type === filters.type : true
    const matchesSearch =
      filters.searchTerm === ""
        ? true
        : notification.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesStatus && matchesChannel && matchesRecipientType && matchesType && matchesSearch
  })

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement | HTMLSelectElement).value
      setFilters((prev) => ({
        ...prev,
        [e.target.name]: value,
      }))
    },
    []
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, searchTerm: value }))
    },
    []
  )

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-anglican-purple dark:text-anglican-purple-100">
          Notifications
        </h1>
        <p className="text-muted dark:text-muted-foreground mt-1">
          System notifications & alerts
        </p>
      </header>

      {/* Filters */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-sm text-muted/60 mb-1">Status</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="status"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Channel</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="channel"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="IN_APP">In-App</SelectItem>
                  <SelectItem value="PUSH">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Recipient Type</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="recipientType"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All recipient types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="PARENTS">Parents</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                  <SelectItem value="MEMBERS">Members</SelectItem>
                  <SelectItem value="ALL">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select
                onValueChange={handleFilterChange}
                defaultValue=""
                name="type"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Search</label>
              <Input
                placeholder="Search by title or message..."
                onValueChange={handleSearchChange}
                value={filters.searchTerm}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>{notifications.length} Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <p className="text-center text-muted dark:text-muted-foreground py-8">
              No notifications found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableClassName>Title</TableClassName>
                  <TableCell className="text-center">Type</TableCell>
                  <TableCell className="text-center">Channel</TableCell>
                  <TableCell className="text-center">Recipient</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    className="hover:bg-angle/5 dark:hover:bg-angle/80"
                  >
                    <TableCell>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-xs text-muted/60">{notification.channel} channel</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={notification.type === "INFO" ? "default" : notification.type === "WARNING" ? "secondary" : notification.type === "SUCCESS" ? "default" : "destructive"}
                        size="sm"
                      >
                        {notification.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={notification.channel === "EMAIL" ? "default" : notification.channel === "SMS" ? "secondary" : notification.channel === "WHATSAPP" ? "default" : "default"}
                        size="sm"
                      >
                        {notification.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={notification.status === "PENDING" ? "secondary" : notification.status === "SENT" ? "default" : notification.status === "DELIVERED" ? "default" : "destructive"}
                        size="sm"
                      >
                        {notification.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="link"
                        className="text-anglican-purple/60 hover:text-anglican-purple text-sm"
                        aria="View notification"
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
          )}
        </CardContent>
      </Card>

      {/* Create Notification Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted/60 mb-1">Title</label>
              <Input name="title" className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Message</label>
              <Input
                name="message"
                className="w-full"
                rows={3}
                placeholder="Notification message content"
              />
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Type</label>
              <Select defaultValue="INFO" name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Channel</label>
              <Select defaultValue="IN_APP" name="channel">
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="IN_APP">In-App</SelectItem>
                  <SelectItem value="PUSH">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Recipient Type</label>
              <Select defaultValue="ALL" name="recipientType">
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="PARENTS">Parents</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                  <SelectItem value="MEMBERS">Members</SelectItem>
                  <SelectItem value="ALL">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted/60 mb-1">Institution ID</label>
              <Input
                name="institutionId"
                placeholder="inst-school-1 or inst-parish-1"
                className="w-full"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={false}
                variant="primary"
                className="w-full">
                Send Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}