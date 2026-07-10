"use client"

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/(licensed)/events/[eventId]/EventDetailCandidateClient.tsx
// Candidate view: QR ticket, event info, live Q&A
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  Hourglass,
  Ticket,
  UserCheck,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { buildStorageUrl } from "@/lib/storage"
import { rsvpEventAction, cancelRsvpAction } from "../actions"
import type { EventStatus, TicketStatus, AttendanceStatus, EventAgendaItem } from "../types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}

function formatTimeOnly(dtStr: string): string {
  try {
    return new Date(dtStr).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return ""
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventInfo {
  id: string
  title: string
  description: string | null
  date: string
  venue: string
  capacity: number
  status: EventStatus
  duration_minutes: number
  event_banner: string | null
}

export interface TicketInfo {
  id: string
  status: TicketStatus
  attendance_status: AttendanceStatus
}

// ─── QR Ticket Card ──────────────────────────────────────────────────────────

export function QRTicketCard({
  ticket,
  candidateName,
  eventTitle,
}: {
  ticket: TicketInfo
  candidateName: string
  eventTitle: string
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(ticket.id, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl)
  }, [ticket.id])

  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center">
          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            {ticket.status === "Confirmed" ? (
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Confirmed
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                <Hourglass className="mr-1 h-3 w-3" /> Waitlisted
              </Badge>
            )}
            {ticket.attendance_status === "Present" && (
              <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
                <UserCheck className="mr-1 h-3 w-3" /> Checked In
              </Badge>
            )}
          </div>

          {/* QR Code */}
          {ticket.status === "Confirmed" && qrDataUrl ? (
            <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
              <img src={qrDataUrl} alt="QR Ticket" className="w-48 h-48" />
            </div>
          ) : (
            ticket.status === "Waitlisted" && (
              <div className="bg-muted rounded-xl p-8 mb-3 flex flex-col items-center gap-2">
                <Hourglass className="h-10 w-10 text-amber-500" />
                <p className="text-xs text-muted-foreground">
                  Your QR ticket will appear here once you're confirmed.
                </p>
              </div>
            )
          )}

          {/* Details */}
          <p className="font-semibold text-sm">{candidateName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{eventTitle}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono break-all">
            Ticket: {ticket.id}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  event: EventInfo
  agenda: EventAgendaItem[]
  ticket: TicketInfo | null
  candidateName: string
}

export function EventDetailCandidateClient({ event, agenda, ticket, candidateName }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRSVP = () => {
    startTransition(async () => {
      try {
        const result = await rsvpEventAction(event.id)
        if (result.status === "Waitlisted") {
          toast.info("Event is at capacity. You've been added to the waitlist.")
        } else {
          toast.success("RSVP confirmed! Check your ticket below.")
        }
        router.refresh()
      } catch (err: any) {
        toast.error(err.message || "Failed to RSVP.")
      }
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelRsvpAction(event.id)
        toast.success("RSVP cancelled.")
        router.refresh()
      } catch (err: any) {
        toast.error(err.message || "Failed to cancel RSVP.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl mx-auto w-full">
      {/* Back */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      {/* 4:5 Aspect Ratio Banner */}
      <div className="w-full max-w-md mx-auto aspect-[4/5] relative rounded-2xl overflow-hidden border shadow-xs bg-muted shrink-0">
        {event.event_banner ? (
          <img
            src={buildStorageUrl("event-banners", event.event_banner) || ""}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 flex flex-col items-center justify-center p-6 text-center gap-2">
            <Ticket className="h-12 w-12 text-primary/40 animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">PlaceTrix Campus Event</span>
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className={cn(
              event.status === "Published" 
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" 
                : "bg-muted text-muted-foreground"
            )}>
              {event.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{event.title}</h1>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
        )}

        <div className="grid gap-3 text-sm text-muted-foreground border-y py-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatDateTime(event.date)} ({event.duration_minutes} Minutes)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Chronological Agenda */}
      {agenda && agenda.length > 0 && (
        <Card className="border">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-base text-foreground">Agenda</h3>
            <div className="relative pl-6 border-l border-border/80 space-y-6">
              {agenda.map((item, idx) => (
                <div key={item.id || idx} className="relative space-y-1">
                  {/* Dot on Timeline */}
                  <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[10px] font-bold text-primary font-mono bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                      {formatTimeOnly(item.start_time)}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed pl-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Ticket / RSVP Action Button */}
      <div className="pt-4 border-t mt-2 flex flex-col gap-2">
        {ticket ? (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 cursor-pointer" size="lg">
                  <Ticket className="h-5 w-5" /> View Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-0 border bg-card">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle className="text-center font-bold">Your Entry Ticket</DialogTitle>
                </DialogHeader>
                <div className="p-4 bg-muted/10">
                  <QRTicketCard
                    ticket={ticket}
                    candidateName={candidateName}
                    eventTitle={event.title}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {event.status !== "Concluded" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20 cursor-pointer animate-in fade-in duration-300"
                    size="lg"
                  >
                    Cancel RSVP
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel your RSVP?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will lose your spot. If the event is full, you'll need to rejoin the waitlist.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep My Spot</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                    >
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Cancel RSVP
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        ) : (
          <Button
            className="w-full gap-2 cursor-pointer"
            size="lg"
            onClick={handleRSVP}
            disabled={isPending || event.status === "Concluded"}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Ticket className="h-5 w-5" />
            )}
            {event.status === "Concluded" ? "Event Ended" : "RSVP to Event"}
          </Button>
        )}
      </div>
    </div>
  )
}
