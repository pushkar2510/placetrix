"use client"

import { useState, useTransition, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QRTicketCard } from "./[eventId]/EventDetailCandidateClient"
import {
  Calendar,
  Search,
  X,
  Users,
  MapPin,
  Clock,
  Ticket,
  CheckCircle2,
  XCircle,
  Hourglass,
  Loader2,
  QrCode,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
  CalendarClock,
  PlayCircle,
  FileText,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { rsvpEventAction } from "./actions"
import type { CandidateEventListItem, TicketStatus } from "./types"

type Tab = "upcoming" | "my" | "past"

interface TabConfig {
  value: Tab
  label: string
  icon: React.ReactNode
  count: number
}

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}



// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({
  isPast,
  myTicketStatus,
}: {
  isPast: boolean
  myTicketStatus: TicketStatus | null
}) {
  if (myTicketStatus === "Confirmed") {
    return (
      <Badge className="gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 text-[11px] px-2 py-0.5">
        <CheckCircle2 className="h-3 w-3" /> Confirmed
      </Badge>
    )
  }
  if (myTicketStatus === "Waitlisted") {
    return (
      <Badge className="gap-1 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 text-[11px] px-2 py-0.5">
        <Hourglass className="h-3 w-3" /> Waitlisted
      </Badge>
    )
  }
  if (isPast) {
    return (
      <Badge className="gap-1 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 text-[11px] px-2 py-0.5">
        Ended
      </Badge>
    )
  }
  return (
    <Badge className="gap-1 border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300 text-[11px] px-2 py-0.5">
      Upcoming
    </Badge>
  )
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({
  icon,
  children,
  tone = "neutral",
}: {
  icon: React.ReactNode
  children: React.ReactNode
  tone?: "neutral" | "sky" | "emerald" | "amber" | "violet" | "rose"
}) {
  const tones = {
    neutral: "border-border/60 bg-muted/50 text-muted-foreground",
    sky: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    violet:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
    rose:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
  } as const

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        tones[tone]
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  )
}

// ─── Access Status Display ───────────────────────────────────────────────────
function TicketStatusDisplay({
  isPast,
  status,
  attendance,
}: {
  isPast: boolean
  status: TicketStatus | null
  attendance: string | null
}) {
  if (attendance === "Present") {
    return (
      <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
      </span>
    )
  }
  if (status === "Confirmed") {
    return (
      <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Seat Confirmed
      </span>
    )
  }
  if (status === "Waitlisted") {
    return (
      <span className="font-medium text-amber-600 dark:text-amber-400 text-xs">
        Waitlisted (Queue)
      </span>
    )
  }
  if (isPast) {
    return (
      <span className="font-medium text-muted-foreground text-xs italic">
        Event Concluded
      </span>
    )
  }
  return (
    <span className="font-medium text-sky-600 dark:text-sky-400 text-xs">
      Registration Open
    </span>
  )
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function CandidateEventCard({
  event,
  candidateName,
  onRefresh,
}: {
  event: CandidateEventListItem
  candidateName: string
  onRefresh: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const isPast = new Date(event.date) < new Date()
  const spotsLeft = Math.max(0, event.capacity - event.tickets_confirmed)
  const hasTicket = event.my_ticket_status !== null && event.my_ticket_status !== "Cancelled"

  const handleRSVP = () => {
    startTransition(async () => {
      try {
        const result = await rsvpEventAction(event.id)
        if (result.status === "Waitlisted") {
          toast.info("Event is at capacity. You've been added to the waitlist.")
        } else {
          toast.success("RSVP confirmed! Check your ticket below.")
        }
        onRefresh()
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  return (
    <Card className="overflow-hidden border-border/70 bg-card p-0">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4 md:p-5">
        {/* Left Info Panel */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-sm md:text-base font-semibold leading-tight text-foreground">
              {event.title}
            </h3>
            <StatusBadge isPast={isPast} myTicketStatus={event.my_ticket_status} />
          </div>

          <p
            className={cn(
              "mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground",
              event.description ? "" : "italic text-muted-foreground/60"
            )}
          >
            {event.description ?? "No description provided"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatChip icon={<Clock className="h-3.5 w-3.5" />} tone="neutral">
              {formatDateTime(event.date)}
              {event.duration_minutes && (
                <span className="text-[10px] text-muted-foreground/60 ml-1">
                  ({event.duration_minutes}m)
                </span>
              )}
            </StatChip>

            <StatChip icon={<MapPin className="h-3.5 w-3.5" />} tone="neutral">
              {event.venue}
            </StatChip>

            <StatChip icon={<Users className="h-3.5 w-3.5" />} tone="neutral">
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
            </StatChip>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:min-w-[220px] md:items-end md:pt-0 md:border-t-0 md:text-right">
          <div className="md:items-end">
            <TicketStatusDisplay
              isPast={isPast}
              status={event.my_ticket_status}
              attendance={event.my_attendance_status}
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto md:justify-end">
            <Link href={`/events/${event.id}`} className="w-full md:w-auto">
              <Button size="sm" variant="outline" className="w-full md:w-auto gap-1.5 text-xs cursor-pointer">
                <Info className="h-3.5 w-3.5" />
                View Details
              </Button>
            </Link>

            {!hasTicket ? (
              !isPast && (
                <div className="w-full md:w-auto">
                  <Button
                    size="sm"
                    onClick={handleRSVP}
                    disabled={isPending}
                    className="w-full md:w-auto gap-1 text-xs cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Ticket className="h-3.5 w-3.5" />
                    )}
                    RSVP
                  </Button>
                </div>
              )
            ) : (
              <div className="w-full md:w-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full md:w-auto gap-1.5 text-xs cursor-pointer">
                      <QrCode className="h-3.5 w-3.5" />
                      View Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md p-0 border bg-card">
                    <DialogHeader className="p-4 border-b">
                      <DialogTitle className="text-center font-bold">Your Entry Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 bg-muted/10">
                      <QRTicketCard
                        ticket={{
                          id: event.my_ticket_id!,
                          status: event.my_ticket_status!,
                          attendance_status: event.my_attendance_status!,
                        }}
                        candidateName={candidateName}
                        eventTitle={event.title}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  events: CandidateEventListItem[]
  initialPage: number
  initialPageSize: number
  initialSearch: string
  initialTab: string
  totalCount: number
  tabCounts: { upcoming: number; my: number; past: number }
  candidateName: string
}

export function EventsCandidateClient({
  events,
  initialPage,
  initialPageSize,
  initialSearch,
  initialTab,
  totalCount,
  tabCounts,
  candidateName,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Local state for search query input
  const [searchInput, setSearchInput] = useState(initialSearch)
  const isOwnUpdateRef = useRef(false)

  // Sync search input with URL params on back/forward
  useEffect(() => {
    if (isOwnUpdateRef.current) {
      isOwnUpdateRef.current = false
      return
    }
    setSearchInput(initialSearch)
  }, [initialSearch])

  // Helper to push parameters to URL
  const updateParams = useCallback(
    (newParams: Partial<Record<string, string | number>>) => {
      const params = new URLSearchParams(window.location.search)
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === "" || val === null) {
          params.delete(key)
        } else {
          params.set(key, String(val))
        }
      })
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router]
  )

  // Debounce search input
  useEffect(() => {
    if (searchInput === initialSearch) return

    const timer = setTimeout(() => {
      isOwnUpdateRef.current = true
      updateParams({ search: searchInput, page: 1 })
    }, 450)
    return () => clearTimeout(timer)
  }, [searchInput, initialSearch, updateParams])

  const activeTab = (initialTab || "upcoming") as Tab

  const tabConfig: TabConfig[] = [
    { value: "upcoming", label: "Upcoming", icon: <CalendarClock className="h-3.5 w-3.5" />, count: tabCounts.upcoming },
    { value: "my", label: "My Tickets", icon: <Ticket className="h-3.5 w-3.5" />, count: tabCounts.my },
    { value: "past", label: "Past Events", icon: <FileText className="h-3.5 w-3.5" />, count: tabCounts.past },
  ]

  const totalPages = Math.ceil(totalCount / initialPageSize)
  const activePage = Math.min(initialPage, Math.max(1, totalPages))

  const onRefresh = () => router.refresh()

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">Events</h1>
        <p className="text-sm text-muted-foreground">
          {totalCount} event{totalCount !== 1 ? "s" : ""} available for you
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => updateParams({ tab: v, page: 1 })}>
        <div className="space-y-4">
          {/* Search (left) + Tabs (right) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              {isPending ? (
                <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-primary animate-spin" />
              ) : (
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Search events..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    isOwnUpdateRef.current = true
                    setSearchInput("")
                    updateParams({ search: "", page: 1 })
                  }}
                  className="absolute right-2.5 top-2.5 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="overflow-x-auto shrink-0">
              <TabsList className="inline-flex h-9 gap-0.5 rounded-lg bg-muted p-1">
                {tabConfig.map(({ value, label, count }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="gap-1.5 rounded-md px-3 text-xs font-medium cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {label}
                    {count > 0 && (
                      <span className={cn(
                        "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                        activeTab === value
                          ? "bg-foreground text-background"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      )}>
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <div className="relative">
            {isPending && (
              <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-[1px] rounded-lg">
                <div className="sticky top-[40vh] mx-auto flex w-fit flex-col items-center gap-2 rounded-lg border bg-popover px-4 py-3 shadow-md">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-xs font-medium text-muted-foreground animate-pulse">Loading...</span>
                </div>
              </div>
            )}
            <div className={cn("space-y-4 transition-opacity duration-200", isPending && "opacity-50 pointer-events-none")}>
              {tabConfig.map(({ value, label }) => {
                if (value !== activeTab) {
                  return <TabsContent key={value} value={value} className="mt-0 outline-none" />
                }
                return (
                  <TabsContent key={value} value={value} className="mt-0 outline-none space-y-4">
                    {totalCount === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-muted-foreground/60" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">No {label.toLowerCase()}</p>
                          <p className="text-xs text-muted-foreground">Check back later for new events</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-3 w-full">
                          {events.map((event) => (
                            <CandidateEventCard key={event.id} event={event} candidateName={candidateName} onRefresh={onRefresh} />
                          ))}
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1 px-1">
                          <div className="text-xs text-muted-foreground">
                            Showing{" "}
                            <span className="font-medium">
                              {totalCount === 0 ? 0 : Math.min(totalCount, (activePage - 1) * initialPageSize + 1)}
                            </span>
                            {" "}to{" "}
                            <span className="font-medium">{Math.min(totalCount, activePage * initialPageSize)}</span>
                            {" "}of{" "}
                            <span className="font-medium">{totalCount}</span> events
                          </div>

                          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                              <Select
                                value={initialPageSize.toString()}
                                onValueChange={(val) => updateParams({ size: val, page: 1 })}
                              >
                                <SelectTrigger className="h-8 w-[70px] text-xs">
                                  <SelectValue placeholder={initialPageSize.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                  {[5, 10, 20, 50].map((s) => (
                                    <SelectItem key={s} value={s.toString()} className="text-xs">{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer"
                                onClick={() => updateParams({ page: 1 })} disabled={activePage === 1}>
                                <ChevronsLeft className="h-4 w-4" />
                                <span className="sr-only">First page</span>
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer"
                                onClick={() => updateParams({ page: Math.max(1, activePage - 1) })} disabled={activePage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous page</span>
                              </Button>
                              <div className="flex items-center justify-center text-xs font-medium min-w-[80px] tabular-nums">
                                Page {activePage} of {totalPages || 1}
                              </div>
                              <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer"
                                onClick={() => updateParams({ page: Math.min(totalPages, activePage + 1) })}
                                disabled={activePage === totalPages || totalPages === 0}>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next page</span>
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer"
                                onClick={() => updateParams({ page: totalPages })}
                                disabled={activePage === totalPages || totalPages === 0}>
                                <ChevronsRight className="h-4 w-4" />
                                <span className="sr-only">Last page</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                )
              })}
            </div>
          </div>

        </div>
      </Tabs>
    </div>
  )
}
